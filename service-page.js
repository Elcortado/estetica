const SERVICE_WHATSAPP="543625181576";
const serviceKey=document.body.dataset.service||location.pathname.split("/").pop().replace(/\.html$/i,"");
const service=SERVICE_TREATMENTS[serviceKey];
const HERO_IMAGES={
 facial:{src:"assets/img/limpiezaProfunda.jpg",alt:"Tratamiento facial profesional en cabina"},
 pestanas:{src:"assets/img/extensioPestañasVolumen.jpeg",alt:"Extensión profesional de pestañas"},
 cejas:{src:"assets/img/depilacionCejas.jpg",alt:"Diseño y depilación profesional de cejas"},
 manos:{src:"assets/img/manicura.jpeg",alt:"Manicura profesional de manos"},
 pies:{src:"assets/img/pedicuraPie.png",alt:"Pedicura profesional de pies"},
 depilacion:{src:"assets/img/depilacionPiernaEntera.jpg",alt:"Servicio profesional de depilación con cera"}
};
const heroImage=document.querySelector(".service-page-hero__image img");
if(heroImage&&HERO_IMAGES[serviceKey]){heroImage.src=HERO_IMAGES[serviceKey].src;heroImage.alt=HERO_IMAGES[serviceKey].alt}
const serviceName=service?.title||document.querySelector(".service-page-hero h1")?.textContent.trim()||"servicio";
const heroBack=document.querySelector(".service-breadcrumb");
if(heroBack)heroBack.innerHTML='<a href="index.html#servicios">← Volver a servicios</a>';
const heroButton=document.querySelector(".service-page-hero .btn");
if(heroButton)heroButton.textContent="Reservar este servicio";
const waFor=treatment=>`https://wa.me/${SERVICE_WHATSAPP}?text=${encodeURIComponent(`Hola Vitali! Quiero solicitar un turno para ${treatment} (${serviceName}).`)}`;
const detail=document.querySelector(".service-detail");
if(service&&detail){
 detail.innerHTML=`<div class="wrap"><div class="service-heading"><p class="eyebrow">Elegí tu experiencia</p><h2>Tratamientos de ${service.title}</h2><p class="service-detail__copy">${service.intro}</p></div><div class="treatment-grid" id="treatmentGrid"></div></div>`;
}
const treatmentGrid=document.querySelector("#treatmentGrid");
if(service&&treatmentGrid){
 treatmentGrid.innerHTML=service.items.map((item,index)=>`<article class="treatment-card" style="--delay:${index*.045}s"><div class="treatment-card__image"><img src="${item.i}" alt="${item.n}" loading="lazy"><span class="treatment-card__index">${String(index+1).padStart(2,"0")}</span></div><div class="treatment-card__body"><h3>${item.n}</h3><p>${item.d}</p><a class="btn treatment-card__button" href="${waFor(item.n)}" target="_blank" rel="noopener">Solicitar turno <span aria-hidden="true">↗</span></a></div></article>`).join("");
 document.querySelectorAll("[data-service-count]").forEach(el=>el.textContent=service.items.length);
}
