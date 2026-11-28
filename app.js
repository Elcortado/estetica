const $=s=>document.querySelector(s),p2=n=>String(n).padStart(2,"0");
const key=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
const MES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const today=new Date();today.setHours(0,0,0,0);
const maxD=new Date(today);maxD.setDate(maxD.getDate()+CONFIG.diasAdelante);
let SERVICIOS=CONFIG.servicios,PROS=CONFIG.profesionales;
const SERVICE_META=Object.fromEntries(CONFIG.servicios.map(s=>[s.n,s]));
const proDe=id=>PROS.find(p=>p.id===id)||PROS[0];
let view=new Date(today.getFullYear(),today.getMonth(),1),selD=null,selT=null,selP=null,selE=null,booked={};
const demo=firebaseConfig.apiKey.startsWith("TU_");
let db,F,unsub=null,fbReady=null,tok=0;

$("#waFlot").href="https://wa.me/"+CONFIG.whatsapp;
const renderServices=()=>{
 const target=$("#cats");
 if(!target)return;
 target.innerHTML=SERVICIOS.map((service,i)=>{
  const s={...(SERVICE_META[service.n]||{}),...service};
  const slug=s.slug||String(s.n).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-");
  const image=s.image||`assets/img/${slug}.svg`;
  const desc=s.desc||s.items?.join(" · ")||"Tratamientos pensados para vos.";
  return `<article class="card service-card" style="--delay:${i*.07}s"><a class="service-card__image" href="${slug}.html" aria-label="Ver servicio de ${s.n}"><img src="${image}" alt="Imagen demostrativa de ${s.n}" loading="lazy"><span class="service-card__index">${String(i+1).padStart(2,"0")}</span></a><div class="service-card__body"><h3>${s.n}</h3><p>${desc}</p><a class="btn service-card__link" href="${slug}.html">Ver servicio <span aria-hidden="true">↗</span></a></div></article>`;
 }).join("");
};
renderServices();

/* Menú responsive */
const navToggle=$("#navToggle"),mainNav=$("#mainNav");
if(navToggle&&mainNav){
 const closeMenu=()=>{navToggle.classList.remove("is-open");mainNav.classList.remove("is-open");navToggle.setAttribute("aria-expanded","false");navToggle.setAttribute("aria-label","Abrir menú")};
 navToggle.onclick=()=>{const open=!mainNav.classList.contains("is-open");navToggle.classList.toggle("is-open",open);mainNav.classList.toggle("is-open",open);navToggle.setAttribute("aria-expanded",String(open));navToggle.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú")};
 mainNav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});
}

/* Contadores que comienzan al entrar en pantalla */
const counters=[...document.querySelectorAll(".counter")];
function animateCounter(el){
 const target=Number(el.dataset.target||0),prefix=el.dataset.prefix||"",suffix=el.dataset.suffix||"",duration=1500,start=performance.now();
 const draw=now=>{const progress=Math.min((now-start)/duration,1),ease=1-Math.pow(1-progress,3),value=Math.round(target*ease);el.textContent=prefix+(value>=1000?value.toLocaleString("es-AR"):value)+suffix;if(progress<1)requestAnimationFrame(draw)};
 requestAnimationFrame(draw);
}
if("IntersectionObserver" in window){
 const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animateCounter(entry.target);counterObserver.unobserve(entry.target)}}),{threshold:.35});
 counters.forEach(el=>counterObserver.observe(el));
}else counters.forEach(animateCounter);

/* Carrusel de packs: autoplay, flechas y puntos */
const packsCarousel=$("#packsCarousel"),packsTrack=$("#packsTrack"),packsPrev=$("#packsPrev"),packsNext=$("#packsNext"),packsDots=$("#packsDots");
if(packsCarousel&&packsTrack){
 const packCards=[...packsTrack.children],reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
 let packIndex=0,packTimer=null;
 const visiblePacks=()=>window.innerWidth<=760?1:window.innerWidth<=940?2:3;
 const maxPackIndex=()=>Math.max(0,packCards.length-visiblePacks());
 const updateDots=()=>{
  const total=maxPackIndex()+1;
  if(packIndex>=total)packIndex=total-1;
  packsDots.innerHTML=Array.from({length:total},(_,i)=>`<button type="button" role="tab" aria-label="Ir al grupo ${i+1}" aria-selected="${i===packIndex}" data-slide="${i}"></button>`).join("");
  packsDots.querySelectorAll("button").forEach(dot=>dot.onclick=()=>{packIndex=Number(dot.dataset.slide);updateCarousel();startPackAuto()});
 };
 const updateCarousel=()=>{
  const cardWidth=packCards[0]?.getBoundingClientRect().width||0,gap=parseFloat(getComputedStyle(packsTrack).gap)||20;
  packIndex=Math.min(packIndex,maxPackIndex());packsTrack.style.transform=`translate3d(-${packIndex*(cardWidth+gap)}px,0,0)`;
  packsPrev.disabled=packIndex===0;packsNext.disabled=packIndex===maxPackIndex();
  packsDots.querySelectorAll("button").forEach((dot,i)=>dot.setAttribute("aria-selected",String(i===packIndex)));
 };
 const goToPack=index=>{const max=maxPackIndex();packIndex=index>max?0:index<0?max:index;updateCarousel()};
 const startPackAuto=()=>{clearInterval(packTimer);packTimer=null;if(!reduceMotion.matches&&maxPackIndex()>0)packTimer=setInterval(()=>goToPack(packIndex+1),5000)};
 packsPrev.onclick=()=>{goToPack(packIndex-1);startPackAuto()};packsNext.onclick=()=>{goToPack(packIndex+1);startPackAuto()};
 packsCarousel.addEventListener("mouseenter",()=>clearInterval(packTimer));packsCarousel.addEventListener("mouseleave",startPackAuto);packsCarousel.addEventListener("focusin",()=>clearInterval(packTimer));packsCarousel.addEventListener("focusout",e=>{if(!packsCarousel.contains(e.relatedTarget))startPackAuto()});
 updateDots();updateCarousel();startPackAuto();
 window.addEventListener("resize",()=>{updateDots();updateCarousel();startPackAuto()});
}

/* Consulta personalizada por WhatsApp */
const consultaForm=$("#consultaForm");
if(consultaForm){
 const consultaStatus=$("#consultaStatus");
 consultaForm.onsubmit=e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target));
  const msg=`Hola Vitali! Quiero hacer una consulta personalizada:\n\nNombre: ${data.nombre.trim()}\nTeléfono: ${data.telefono.trim()}\nConsulta: ${data.mensaje.trim()}`;
  const url=`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  consultaStatus.textContent="Abrimos WhatsApp para que puedas enviar tu consulta.";
  consultaStatus.classList.remove("hide");
  e.target.reset();
  window.open(url,"_blank","noopener");
 };
}

const toM=t=>{const[a,b]=t.split(":");return a*60+ +b};
function slotsDe(d,p){const h=(p.horarios||CONFIG.horarios)[d.getDay()];if(!h)return[];const o=[];for(let m=toM(h[0]);m+CONFIG.duracion<=toM(h[1]);m+=CONFIG.duracion)o.push(p2(m/60|0)+":"+p2(m%60));return o}
const idOf=(f,t,p)=>`${f}_${t.replace(":","")}_${p}`;
const fmtF=f=>f.split("-").reverse().join("/");
const prosDe=(e,dt)=>PROS.filter(p=>(!p.esp||p.esp.includes(e))&&slotsDe(dt,p).length);
const espsDe=dt=>SERVICIOS.map(s=>s.n).filter(e=>prosDe(e,dt).length);

function cal(){
 const y=view.getFullYear(),m=view.getMonth();
 $("#mes").textContent=MES[m]+" "+y;
 let h=["L","M","M","J","V","S","D"].map(x=>`<b>${x}</b>`).join("");
 h+="<i></i>".repeat((new Date(y,m,1).getDay()+6)%7);
 for(let d=1,n=new Date(y,m+1,0).getDate();d<=n;d++){
  const dt=new Date(y,m,d),k=key(dt),ok=dt>=today&&dt<=maxD&&PROS.some(p=>slotsDe(dt,p).length);
  h+=`<button class="day${k===selD?" sel":""}${+dt===+today?" hoy":""}" data-d="${k}" ${ok?"":"disabled"}>${d}</button>`;
 }
 $("#grid").innerHTML=h;
 $("#prev").disabled=view<=new Date(today.getFullYear(),today.getMonth(),1);
 $("#next").disabled=new Date(y,m+1,1)>maxD;
}
function slots(){
 if(!selD)return;
 const[y,m,d]=selD.split("-").map(Number),dt=new Date(y,m-1,d),now=new Date(),es=espsDe(dt);
 if(selE&&!es.includes(selE)){selE=selP=selT=null}
 const ps=selE?prosDe(selE,dt):[];
 if(selP&&!ps.some(p=>p.id===selP)){selP=selT=null}
 if(selE&&!selP&&ps.length===1)selP=ps[0].id;
 const chips=(a,k,sel)=>a.map(x=>`<button type="button" class="${x.id===sel?"on":""}" data-${k}="${x.id}">${x.n}</button>`).join("");
 $("#slotHint").classList.add("hide");$("#fechaTxt").classList.remove("hide");
 $("#fechaTxt").textContent=dt.toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
 $("#espBox").classList.remove("hide");
 $("#esps").innerHTML=es.length?chips(es.map(n=>({id:n,n})),"e",selE):'<p class="hint" style="margin:0">No hay atención ese día.</p>';
 $("#proBox").classList.toggle("hide",!selE||PROS.length<2);
 $("#pros").innerHTML=chips(ps,"p",selP);
 const ver=!!(selE&&selP);
 $("#horBox").classList.toggle("hide",!ver);$("#legend").classList.toggle("hide",!ver);
 $("#slots").innerHTML=ver?slotsDe(dt,proDe(selP)).map(t=>{
  const e=booked[idOf(selD,t,selP)];
  if(e)return`<button class="slot" disabled><s>${t}</s><small>${e==="confirmado"?"Reservado":"Pendiente"}</small></button>`;
  const past=selD===key(now)&&new Date(`${selD}T${t}`)<=now;
  return`<button class="slot${t===selT?" sel":""}" data-t="${t}" ${past?"disabled":""}>${t}</button>`;
 }).join(""):"";
}
function refresh(){
 if(selT&&booked[idOf(selD,selT,selP)]){selT=null;$("#formBox").classList.add("hide")}
 cal();slots();
}
function limpiarSel(){
 selD=selT=selE=selP=null;$("#formBox").classList.add("hide");$("#slotHint").classList.remove("hide");
 ["#fechaTxt","#espBox","#proBox","#horBox","#legend"].forEach(s=>$(s).classList.add("hide"));$("#slots").innerHTML="";
}

/* Solo se descargan los turnos ocupados del mes que se está mirando */
function escuchar(){
 if(demo){refresh();return}
 const y=view.getFullYear(),m=view.getMonth(),mm=p2(m+1),my=++tok;
 const lo=(y===today.getFullYear()&&m===today.getMonth())?key(today):`${y}-${mm}-01`,hi=`${y}-${mm}-31`;
 if(unsub){unsub();unsub=null}
 booked={};refresh();
 fbReady.then(()=>{
  if(my!==tok)return;
  unsub=F.onSnapshot(F.query(F.collection(db,"ocupados"),F.where("fecha",">=",lo),F.where("fecha","<=",hi)),snap=>{
   booked={};snap.forEach(d=>booked[d.id]=d.data().estado);refresh();
  },()=>{$("#slotHint").textContent="No se pudo cargar la disponibilidad. Recargá la página."});
 }).catch(()=>{$("#slotHint").textContent="No se pudo conectar con Firebase. Recargá la página."});
}
async function guardar(id,rec){
 if(demo){booked[id]="pendiente";try{localStorage.setItem("vitali_demo2",JSON.stringify(booked))}catch(e){}return}
 await fbReady;
 const b=F.writeBatch(db);
 b.set(F.doc(db,"ocupados",id),{fecha:rec.fecha,hora:rec.hora,pro:rec.pro,estado:"pendiente"});
 b.set(F.doc(db,"turnos",id),{...rec,creado:F.serverTimestamp()});
 await b.commit();
}
if(demo){
 $("#demo").classList.remove("hide");
 try{booked=JSON.parse(localStorage.getItem("vitali_demo2")||"{}")}catch(e){}
}else{
 const FB="https://www.gstatic.com/firebasejs/10.12.2/";
 fbReady=Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-firestore.js")]).then(([a,f])=>{F=f;db=f.getFirestore(a.initializeApp(firebaseConfig))});
}

$("#grid").onclick=e=>{const b=e.target.closest(".day");if(!b)return;selD=b.dataset.d;selT=null;$("#formBox").classList.add("hide");$("#okBox").classList.add("hide");refresh()};
$("#esps").onclick=e=>{const b=e.target.closest("[data-e]");if(!b)return;selE=b.dataset.e;selP=null;selT=null;$("#formBox").classList.add("hide");slots()};
$("#pros").onclick=e=>{const b=e.target.closest("[data-p]");if(!b)return;selP=b.dataset.p;selT=null;$("#formBox").classList.add("hide");slots()};
$("#slots").onclick=e=>{
 const b=e.target.closest("[data-t]");if(!b)return;selT=b.dataset.t;
 $("#okBox").classList.add("hide");$("#formBox").classList.remove("hide");$("#err").classList.add("hide");
 $("#resumen").textContent="Turno de "+selE+": "+fmtF(selD)+" a las "+selT+" h"+(PROS.length>1?" con "+proDe(selP).n:"");
 slots();$("#formBox").scrollIntoView({behavior:"smooth",block:"nearest"});
};
const mover=n=>{view=new Date(view.getFullYear(),view.getMonth()+n,1);limpiarSel();$("#okBox").classList.add("hide");cal();escuchar()};
$("#prev").onclick=()=>mover(-1);$("#next").onclick=()=>mover(1);

$("#form").onsubmit=async e=>{
 e.preventDefault();
 const f=Object.fromEntries(new FormData(e.target)),btn=$("#enviar"),err=$("#err"),id=idOf(selD,selT,selP);
 const rec={nombre:f.nombre.trim(),telefono:f.telefono.trim(),servicio:selE,comentario:(f.comentario||"").trim(),fecha:selD,hora:selT,pro:selP};
 btn.disabled=true;btn.textContent="Reservando…";err.classList.add("hide");
 try{await guardar(id,rec)}
 catch(x){
  err.textContent=x.code==="permission-denied"?"Ese horario se acaba de ocupar. Elegí otro, por favor.":"No pudimos guardar el turno. Revisá tu conexión e intentá de nuevo.";
  err.classList.remove("hide");btn.disabled=false;btn.textContent="Reservar turno";
  if(x.code==="permission-denied"){booked[id]="pendiente";refresh()}
  return;
 }
 const msg=`Hola Vitali! Quiero reservar un turno:\n\nNombre: ${rec.nombre}\nTeléfono: ${rec.telefono}\nEspecialidad: ${rec.servicio}\n`+(PROS.length>1?`Profesional: ${proDe(selP).n}\n`:"")+`Fecha: ${fmtF(rec.fecha)}\nHora: ${rec.hora} h\n`+(rec.comentario?`Comentarios: ${rec.comentario}\n`:"")+`\nTurno pendiente de confirmación.`;
 const url=`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
 $("#waLink").href=url;
 $("#formBox").classList.add("hide");$("#okBox").classList.remove("hide");
 e.target.reset();btn.disabled=false;btn.textContent="Reservar turno";
 booked[id]="pendiente";selT=null;refresh();
 window.open(url,"_blank");
};
$("#otro").onclick=()=>$("#okBox").classList.add("hide");

async function cargarCatalogoPublico(){
 if(demo)return;
 try{
  await fbReady;
  const snap=await F.getDoc(F.doc(db,"config","catalogo"));
  if(!snap.exists())return;
  const data=snap.data();
  if(Array.isArray(data.servicios)){
   const remoto=Object.fromEntries(data.servicios.filter(s=>s&&s.n).map(s=>[String(s.n),s]));
   SERVICIOS=CONFIG.servicios.map(base=>{
    const s=remoto[base.n]||{};
    return {...base,p:String(s.p||base.p||"Consultar"),items:Array.isArray(s.items)?s.items.filter(Boolean).map(String):base.items};
   });
  }
  if(Array.isArray(data.profesionales))PROS=data.profesionales.filter(p=>p&&p.id&&p.n).map(p=>{const clean={id:String(p.id),n:String(p.n)};if(Array.isArray(p.esp)&&p.esp.length)clean.esp=p.esp.filter(Boolean).map(String);return clean});
  renderServices();refresh();
 }catch(e){/* Se mantiene el catálogo local si Firebase no permite lectura pública. */}
}

cal();escuchar();cargarCatalogoPublico();
