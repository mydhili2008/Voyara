import os, sqlite3
from pathlib import Path
from datetime import date, datetime
from flask import Flask, jsonify, render_template, request

BASE = Path(__file__).resolve().parent
INSTANCE = BASE / "instance"
INSTANCE.mkdir(exist_ok=True)
DB_PATH = os.environ.get("VOYARA_DB_PATH", str(INSTANCE / "voyara.sqlite3"))
app = Flask(__name__, template_folder="templates", static_folder="static")

# Illustrative sample data only — not live inventory.
OPTIONS = {
 "flight": [("Voyara Air","Direct journey","Approx. 1h 35m · Economy",4599),("Skyline Connect","Flexible fare","Approx. 2h 10m · 1 stop",3899),("Horizon Airways","Comfort fare","Approx. 1h 50m · Economy",5299)],
 "train": [("Coastal Express","Scenic route","Approx. 8h 20m · Reserved",899),("Intercity Rail","Day journey","Approx. 7h 45m · Chair car",1299),("Nightline Rail","Overnight journey","Approx. 9h · Sleeper",1499)],
 "bus": [("GreenRoad","Premium coach","Approx. 9h · AC sleeper",1099),("Roadbird Express","Comfort coach","Approx. 10h · AC seater",799),("Night Owl Travels","Night service","Approx. 8h 45m · Sleeper",1299)],
 "ship": [("Blue Horizon","Coastal sailing","Illustrative route · Cabin class",6499),("Ocean Passage","Sea-view journey","Illustrative route · Standard cabin",8299),("Island Link","Island connection","Illustrative route · Standard seat",2799)]
}

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT, mode TEXT NOT NULL,
          origin TEXT NOT NULL, destination TEXT NOT NULL, departure_date TEXT NOT NULL,
          travellers INTEGER NOT NULL, provider TEXT NOT NULL, price INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'DEMO_REQUESTED', created_at TEXT NOT NULL)""")

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/health")
def health():
    return jsonify(status="ok", service="Voyara demo API")

@app.get("/api/journeys")
def journeys():
    mode = request.args.get("mode","flight").strip().lower()
    origin = request.args.get("origin","").strip()
    destination = request.args.get("destination","").strip()
    day = request.args.get("date","").strip()
    if mode not in OPTIONS:
        return jsonify(error="mode must be flight, train, bus or ship"), 400
    if not origin or not destination or len(origin)>100 or len(destination)>100:
        return jsonify(error="Enter valid origin and destination (max 100 characters)."), 400
    if origin.casefold() == destination.casefold():
        return jsonify(error="Origin and destination must be different."), 400
    if day:
        try:
            if date.fromisoformat(day) < date.today():
                return jsonify(error="Departure date cannot be in the past."), 400
        except ValueError:
            return jsonify(error="Date must use YYYY-MM-DD format."), 400
    results = [{"provider":p,"title":t,"detail":d,"price":v,"mode":mode,
                "origin":origin,"destination":destination,"departure_date":day,"demo":True}
               for p,t,d,v in OPTIONS[mode]]
    return jsonify(demo=True, message="Illustrative sample data only. No live availability is checked.", journeys=results)

@app.post("/api/bookings")
def create_booking():
    data = request.get_json(silent=True) or {}
    mode = str(data.get("mode","")).strip().lower()
    origin = str(data.get("origin","")).strip()
    destination = str(data.get("destination","")).strip()
    day = str(data.get("departure_date","")).strip()
    provider = str(data.get("provider","")).strip()
    try:
        travellers = int(data.get("travellers",1))
        parsed_day = date.fromisoformat(day)
    except (TypeError, ValueError):
        return jsonify(error="Provide a valid departure_date (YYYY-MM-DD) and traveller count."), 400
    if mode not in OPTIONS:
        return jsonify(error="Choose flight, train, bus or ship."), 400
    if not origin or not destination or len(origin)>100 or len(destination)>100 or origin.casefold()==destination.casefold():
        return jsonify(error="Enter two different valid locations."), 400
    if parsed_day < date.today():
        return jsonify(error="Departure date cannot be in the past."), 400
    if not 1 <= travellers <= 9:
        return jsonify(error="Travellers must be between 1 and 9."), 400
    selected = next((x for x in OPTIONS[mode] if x[0] == provider), None)
    if not selected:
        return jsonify(error="Unknown sample provider. Search again."), 400
    total = selected[3] * travellers
    created = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    with db() as conn:
        cur = conn.execute("INSERT INTO bookings(mode,origin,destination,departure_date,travellers,provider,price,status,created_at) VALUES(?,?,?,?,?,?,?,'DEMO_REQUESTED',?)",
                           (mode,origin,destination,day,travellers,provider,total,created))
        booking_id = cur.lastrowid
    return jsonify(message="Demo request saved; this is not a confirmed ticket.",
                   booking={"id":booking_id,"mode":mode,"origin":origin,"destination":destination,
                            "departure_date":day,"travellers":travellers,"provider":provider,
                            "price":total,"status":"DEMO_REQUESTED","created_at":created}), 201

@app.get("/api/bookings")
def list_bookings():
    # Public demo endpoint only. Add authentication/authorization before production.
    with db() as conn:
        rows = conn.execute("SELECT * FROM bookings ORDER BY id DESC LIMIT 100").fetchall()
    return jsonify(warning="Demo endpoint: records are not private. Do not use as-is in production.",
                   bookings=[dict(row) for row in rows])

@app.errorhandler(404)
def not_found(err):
    if request.path.startswith("/api/"):
        return jsonify(error="API endpoint not found"), 404
    return "Page not found", 404

init_db()
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT","5000")), debug=True)
