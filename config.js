// Configuración de la web y del panel: horarios, servicios, profesionales, WhatsApp y Firebase.
const CONFIG = {
  whatsapp: "543625181576", // código de país + número, sin + ni espacios
  duracion: 60, // minutos por turno
  diasAdelante: 60, // cuántos días a futuro se puede reservar
  profesionales: [
    // una agenda por profesional o cabina; dejá una sola para ocultar el selector
    { id: "ana", n: "Ana" },
    { id: "lucia", n: "Lucía" }, // opcional, horarios propios: {id:"lucia",n:"Lucía",horarios:{1:["14:00","19:00"]}}
  ],
  horarios: {
    1: ["09:00", "19:00"],
    2: ["09:00", "19:00"],
    3: ["09:00", "19:00"],
    4: ["09:00", "19:00"],
    5: ["09:00", "19:00"],
    6: ["09:00", "13:00"],
  }, // 0 = domingo (cerrado)
  servicios: [
    {
      n: "Facial",
      slug: "facial",
      desc: "Limpieza, hidratación y cuidado personalizado para devolverle luminosidad y equilibrio a tu piel.",
      image: "assets/img/limpiezaProfunda.jpg",
      items: [
        "Limpieza facial profunda",
        "Hidratación y peeling",
        "Radiofrecuencia facial",
      ],
      p: "$18.000",
    },
    {
      n: "Pestañas",
      slug: "pestanas",
      desc: "Diseños de mirada que realzan tus ojos con resultados naturales, definidos y personalizados.",
      image: "assets/img/extensioPestañasVolumen.jpeg",
      items: ["Extensiones clásicas", "Volumen suave", "Lifting y tinte"],
      p: "$22.000",
    },
    {
      n: "Cejas",
      slug: "cejas",
      desc: "Diseño y perfilado para armonizar tus facciones y destacar la expresión de tu rostro.",
      image: "assets/img/depilacionCejas.jpg",
      items: ["Diseño de cejas", "Perfilado con pinza o cera", "Laminado y tinte"],
      p: "$10.000",
    },
    {
      n: "Manos",
      slug: "manos",
      desc: "Manicura, esmaltado y cuidado de cutículas para mantener tus manos prolijas y elegantes.",
      image: "assets/img/manicura.jpeg",
      items: ["Manicura clásica", "Esmaltado semipermanente", "Kapping y nail art"],
      p: "$10.000",
    },
    {
      n: "Pies",
      slug: "pies",
      desc: "Pedicura y cuidado integral para lucir pies suaves, saludables y siempre bien arreglados.",
      image: "assets/img/pedicuraPie.png",
      items: ["Pedicura clásica", "Esmaltado semipermanente", "Spa de pies"],
      p: "$12.000",
    },
    {
      n: "Depilación",
      slug: "depilacion",
      desc: "Métodos de depilación pensados para una piel suave, cuidada y confortable.",
      image: "assets/img/depilacionPiernaEntera.jpg",
      items: ["Depilación con cera", "Depilación definitiva", "Diseño de rostro"],
      p: "Consultar",
    },
  ],
};

// Configuración de Firebase compartida por la web (app.js) y el panel (admin.js).
// Pegá acá el firebaseConfig que te da la consola de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDF-3x0QxjwpkP5xbXL7n8n91IGOQ3pK7w",
  authDomain: "usuarioprueba-68bd9.firebaseapp.com",
  projectId: "usuarioprueba-68bd9",
  storageBucket: "usuarioprueba-68bd9.firebasestorage.app",
  messagingSenderId: "977813418974",
  appId: "1:977813418974:web:859b1c49dc4d1142bc234f"
};
