const navToggle=document.querySelector(".nav-toggle"),mainNav=document.querySelector(".nav__links");
if(navToggle&&mainNav){
 const closeMenu=()=>{navToggle.classList.remove("is-open");mainNav.classList.remove("is-open");navToggle.setAttribute("aria-expanded","false");navToggle.setAttribute("aria-label","Abrir menú")};
 navToggle.addEventListener("click",()=>{const open=!mainNav.classList.contains("is-open");navToggle.classList.toggle("is-open",open);mainNav.classList.toggle("is-open",open);navToggle.setAttribute("aria-expanded",String(open));navToggle.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú")});
 mainNav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
 document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu()});
}
if(document.querySelector(".service-detail")){
 const dataScript=document.createElement("script");
 dataScript.src="service-data.js";
 dataScript.onload=()=>{const pageScript=document.createElement("script");pageScript.src="service-page.js";document.body.appendChild(pageScript)};
 document.head.appendChild(dataScript);
}
