const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let mode="flight", timer;
const modes={flight:"Flights",train:"Trains",bus:"Buses",ship:"Ships"};
function toast(msg){const e=$("#toast");e.textContent=msg;e.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>e.classList.remove("show"),3400)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const date=$("#departDate"), now=new Date();date.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;date.value=date.min;
const nav=$(".nav-links"), menu=$(".menu-toggle");menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"×":"☰"});
$$(".nav-links a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="☰"}));
function setMode(m){mode=m;$$(".transport-tab").forEach(b=>{let active=b.dataset.mode===m;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active))})}
$$(".transport-tab").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
$$("[data-pick]").forEach(b=>b.addEventListener("click",()=>{setMode(b.dataset.pick);$("#booking").scrollIntoView({behavior:"smooth"})}));
$("#swapBtn").addEventListener("click",()=>{let a=$("#origin"),b=$("#destination");[a.value,b.value]=[b.value,a.value]});
function dateText(v){return v?new Date(v+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"Selected date"}
$("#searchForm").addEventListener("submit",async ev=>{
 ev.preventDefault();const origin=$("#origin").value.trim(),destination=$("#destination").value.trim(),day=date.value;
 if(origin.toLowerCase()===destination.toLowerCase())return toast("Choose two different places.");
 const out=$("#searchResults");out.classList.add("visible");out.innerHTML="<p>Searching sample journeys…</p>";
 try{
  const params=new URLSearchParams({mode,origin,destination,date:day});
  const res=await fetch(`/api/journeys?${params}`),data=await res.json();if(!res.ok)throw Error(data.error||"Search failed");
  out.innerHTML=`<div class="results-title"><div><p class="eyebrow">SAMPLE JOURNEYS · ${modes[mode].toUpperCase()}</p><h3>${esc(origin)} → ${esc(destination)}</h3></div><span class="muted small">${dateText(day)}</span></div><p class="demo-note">${esc(data.message)}</p><div class="result-list">${data.journeys.map((j,i)=>`<article class="result-card"><span class="result-mode">${modes[mode].toUpperCase()} · OPTION 0${i+1}</span><h4>${esc(j.provider)}</h4><p>${esc(j.title)} · ${esc(j.detail)}</p><div class="result-bottom"><strong>₹${Number(j.price).toLocaleString("en-IN")}</strong><button type="button" data-provider="${esc(j.provider)}">Request demo booking</button></div></article>`).join("")}</div>`;
  $$("[data-provider]").forEach(b=>b.addEventListener("click",()=>book(b.dataset.provider)));
  out.scrollIntoView({behavior:"smooth",block:"nearest"});
 }catch(err){out.innerHTML=`<p class="error-text">${esc(err.message)}. Please try again.</p>`}
});
async function book(provider){
 const payload={mode,origin:$("#origin").value.trim(),destination:$("#destination").value.trim(),departure_date:date.value,travellers:Number($("#travellers").value),provider};
 try{const res=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();if(!res.ok)throw Error(data.error||"Could not save request");toast(`Demo request #${data.booking.id} saved. Not a confirmed ticket.`)}catch(err){toast(err.message)}
}
$("#newsletterForm").addEventListener("submit",e=>{e.preventDefault();$("#newsletterMessage").textContent="Thanks! Newsletter signup is a frontend demo.";$("#email").value=""});
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
if("IntersectionObserver"in window&&!reduced){const obs=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in-view");obs.unobserve(x.target)}}),{threshold:.12});$$(".reveal").forEach(e=>obs.observe(e))}else $$(".reveal").forEach(e=>e.classList.add("in-view"));
let pending=false;addEventListener("scroll",()=>{if(pending||reduced)return;pending=true;requestAnimationFrame(()=>{let y=scrollY,hero=$(".hero-image");if(hero)hero.style.transform=`scale(1.08) translateY(${Math.min(y*.12,80)}px)`;let q=$(".quote-bg");if(q)q.style.transform=`scale(1.04) translateY(${Math.max(-30,Math.min(30,-q.parentElement.getBoundingClientRect().top*.06))}px)`;pending=false})},{passive:true});

// Autoplay hero slider, manual navigation and gentle pointer parallax.
(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dots button')];
  if (!slides.length) return;
  const captions = [
    { place: '⌖ PALAWAN, PHILIPPINES', caption: 'Discover the extraordinary' },
    { place: '⌖ DOLOMITES, ITALY', caption: 'Find your higher ground' },
    { place: '⌖ MARRAKECH, MOROCCO', caption: 'Get wonderfully lost' }
  ];
  const number = document.querySelector('.hero-slide-number');
  const place = document.querySelector('.hero-place');
  const caption = document.querySelector('.hero-slide-caption');
  let current = 0, timer;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    if (number) number.textContent = `0${current + 1} / 0${slides.length}`;
    if (place) place.textContent = captions[current].place;
    if (caption) caption.textContent = captions[current].caption;
  }
  function restart() {
    clearInterval(timer);
    if (!reduced) timer = setInterval(() => show(current + 1), 6200);
  }
  document.querySelector('.hero-next')?.addEventListener('click', () => { show(current + 1); restart(); });
  document.querySelector('.hero-prev')?.addEventListener('click', () => { show(current - 1); restart(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart(); }));
  const hero = document.querySelector('.hero');
  if (hero && matchMedia('(pointer:fine)').matches && !reduced) {
    hero.addEventListener('pointermove', event => {
      const dx = (event.clientX / innerWidth - .5) * -10;
      const dy = (event.clientY / innerHeight - .5) * -7;
      const image = hero.querySelector('.hero-slide.is-active .hero-image');
      if (image) image.style.transform = `scale(1.04) translate(${dx}px,${dy}px)`;
    });
    hero.addEventListener('pointerleave', () => {
      const image = hero.querySelector('.hero-slide.is-active .hero-image');
      if (image) image.style.transform = '';
    });
  }
  restart();
})();
