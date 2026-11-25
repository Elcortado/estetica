const FB="https://www.gstatic.com/firebasejs/10.12.2/";
const PAIS="549"; // prefijo para armar el link de WhatsApp si la clienta no escribió el código de país

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fmtF=f=>f.split("-").reverse().join("/");
const hoy0=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const PN=id=>(CONFIG.profesionales.find(p=>p.id===id)||{}).n||"";
const esp=t=>(CONFIG.servicios.find(s=>s.items.includes(t.servicio))||{n:"Otro"}).n; // especialidad = categoría del servicio
let F,AU,db,auth,turnos={},estados={},unsubs=[],fe="todos",pf="",ef="",dD=key(hoy0()),dH="";

function wa(t){
 let d=String(t.telefono).replace(/\D/g,"").replace(/^0+/,"");
 if(!d.startsWith("54"))d=PAIS+d;
 const m=`Hola ${t.nombre}! Te confirmamos tu turno de ${t.servicio}${PN(t.pro)?" con "+PN(t.pro):""} el ${fmtF(t.fecha)} a las ${t.hora} h. ¡Te esperamos en Vitali!`;
 return`https://wa.me/${d}?text=${encodeURIComponent(m)}`;
}
const txtRango=()=>dD&&dH?(dD===dH?`el ${fmtF(dD)}`:`del ${fmtF(dD)} al ${fmtF(dH)}`):dD?`desde el ${fmtF(dD)} en adelante`:dH?`hasta el ${fmtF(dH)}`:"en todo el historial";

function render(){
 const all=Object.entries(turnos).map(([id,t])=>({...t,id,estado:estados[id]||"pendiente"}));
 const rows=all.filter(t=>(!pf||t.pro===pf)&&(!ef||esp(t)===ef)&&(fe==="todos"||t.estado===fe))
  .sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora));
 const pend=rows.filter(t=>t.estado==="pendiente").length;
 const cuenta=f=>{const m={};rows.forEach(t=>{const k=f(t);m[k]=(m[k]||0)+1});return Object.entries(m).map(([k,v])=>`${esc(k)} <b>${v}</b>`).join(" · ")};
 $("#tot").innerHTML=`<p class="n"><b>${rows.length}</b> ${rows.length===1?"turno":"turnos"} ${txtRango()}</p>`+(rows.length
  ?`<p>${pend} pendientes · ${rows.length-pend} confirmados</p><p>Por especialidad: ${cuenta(esp)}</p>`+(CONFIG.profesionales.length>1?`<p>Por profesional: ${cuenta(t=>PN(t.pro)||"Sin asignar")}</p>`:""):"");
 if(!rows.length){$("#lista").innerHTML='<p class="vacio">No hay turnos para esta selección.</p>';return}
 let h="",dia="";
 for(const t of rows){
  if(t.fecha!==dia){
   dia=t.fecha;const[y,m,d]=dia.split("-").map(Number);
   h+=`<h3 class="dia">${new Date(y,m-1,d).toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</h3>`;
  }
  const ok=t.estado==="confirmado";
  h+=`<div class="t"><div class="h">${esc(t.hora)}</div>
   <div><p><strong>${esc(t.nombre)}</strong> <span class="tag${ok?" ok":""}">${ok?"Confirmado":"Pendiente"}</span></p>
   <p>${esc(esp(t))}: ${esc(t.servicio)}${PN(t.pro)?" · "+esc(PN(t.pro)):""} · Tel. ${esc(t.telefono)}</p>${t.comentario?`<p>“${esc(t.comentario)}”</p>`:""}</div>
   <div class="acc">${ok?"":`<button class="btn" data-a="ok" data-id="${esc(t.id)}">Confirmar</button>`}
   <a class="btn g" target="_blank" rel="noopener" href="${esc(wa(t))}">WhatsApp</a>
   <button class="btn r" data-a="del" data-id="${esc(t.id)}">Cancelar</button></div></div>`;
 }
 $("#lista").innerHTML=h;
}

const aviso=m=>{$("#aviso").textContent=m;$("#aviso").classList.remove("hide")};
const sinPermiso=()=>aviso("No tenés permiso para ver los turnos. Revisá las reglas de Firestore y que el UID cargado sea el tuyo.");

/* Solo se leen los turnos del rango elegido */
function suscribir(){
 unsubs.forEach(u=>u());turnos={};estados={};render();
 const w=[];if(dD)w.push(F.where("fecha",">=",dD));if(dH)w.push(F.where("fecha","<=",dH));
 const q=c=>F.query(F.collection(db,c),...w);
 unsubs=[
  F.onSnapshot(q("turnos"),s=>{turnos={};s.forEach(d=>turnos[d.id]=d.data());render()},sinPermiso),
  F.onSnapshot(q("ocupados"),s=>{estados={};s.forEach(d=>estados[d.id]=d.data().estado);render()},sinPermiso)
 ];
}
function rango(r){
 const h=hoy0();
 if(r==="prox"){dD=key(h);dH=""}
 else if(r==="hoy"){dD=dH=key(h)}
 else if(r==="mes"){dD=key(new Date(h.getFullYear(),h.getMonth(),1));dH=key(new Date(h.getFullYear(),h.getMonth()+1,0))}
 else if(r==="30"){const a=new Date(h);a.setDate(a.getDate()-30);dD=key(a);dH=key(h)}
 else{dD=dH=""}
 $("#fd").value=dD;$("#fh").value=dH;suscribir();
}
function entrar(u){
 $("#loginBox").classList.add("hide");$("#panel").classList.remove("hide");$("#salir").classList.remove("hide");
 $("#quien").textContent=u.email;suscribir();
}
function salir(){
 unsubs.forEach(u=>u());unsubs=[];turnos={};estados={};
 $("#panel").classList.add("hide");$("#salir").classList.add("hide");$("#quien").textContent="";
 $("#aviso").classList.add("hide");$("#loginBox").classList.remove("hide");
}

$("#tabs").onclick=e=>{
 const b=e.target.closest("[data-f]");if(!b)return;
 fe=b.dataset.f;document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x===b));render();
};
$("#rapidos").onclick=e=>{const b=e.target.closest("[data-r]");if(b)rango(b.dataset.r)};
$("#fd").onchange=$("#fh").onchange=()=>{
 dD=$("#fd").value;dH=$("#fh").value;
 if(dD&&dH&&dD>dH){[dD,dH]=[dH,dD];$("#fd").value=dD;$("#fh").value=dH}
 suscribir();
};
$("#pfil").onchange=e=>{pf=e.target.value;render()};
$("#efil").onchange=e=>{ef=e.target.value;render()};
$("#pfil").innerHTML='<option value="">Todas</option>'+CONFIG.profesionales.map(p=>`<option value="${p.id}">${p.n}</option>`).join("");
$("#efil").innerHTML='<option value="">Todas</option>'+[...CONFIG.servicios.map(s=>s.n),"Otro"].map(n=>`<option>${n}</option>`).join("");
if(CONFIG.profesionales.length<2)$("#pbox").classList.add("hide");
$("#fd").value=dD;

$("#lista").onclick=async e=>{
 const b=e.target.closest("[data-a]");if(!b)return;const id=b.dataset.id;
 try{
  if(b.dataset.a==="ok")await F.updateDoc(F.doc(db,"ocupados",id),{estado:"confirmado"});
  else if(confirm("¿Cancelar este turno? El horario volverá a quedar disponible.")){
   const w=F.writeBatch(db);w.delete(F.doc(db,"ocupados",id));w.delete(F.doc(db,"turnos",id));await w.commit();
  }
 }catch(x){alert("No se pudo completar la acción. Revisá tu conexión y los permisos.")}
};
$("#login").onsubmit=async e=>{
 e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),er=$("#lerr");er.classList.add("hide");
 try{await AU.signInWithEmailAndPassword(auth,f.email,f.pass)}
 catch(x){er.textContent="Email o contraseña incorrectos.";er.classList.remove("hide")}
};
$("#salir").onclick=()=>AU.signOut(auth);

(async()=>{
 if(firebaseConfig.apiKey.startsWith("TU_")){aviso("Falta configurar Firebase: pegá tu firebaseConfig en config.js.");return}
 try{
  const[a,f,au]=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-firestore.js"),import(FB+"firebase-auth.js")]);
  F=f;AU=au;const app=a.initializeApp(firebaseConfig);db=f.getFirestore(app);auth=au.getAuth(app);
  au.onAuthStateChanged(auth,u=>u?entrar(u):salir());
 }catch(x){aviso("No se pudo cargar Firebase. Revisá tu conexión.")}
})();
