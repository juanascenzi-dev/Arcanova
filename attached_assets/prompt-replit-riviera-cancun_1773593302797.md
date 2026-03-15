# PROMPT PARA REPLIT — Riviera Cancún Premium Tourism Website

## CONTEXTO DEL PROYECTO

Necesito una landing page / sitio web completo para **Riviera Cancún Premium**, un servicio de turismo premium en Cancún y la Riviera Maya, México. Vendemos excursiones exclusivas (yates privados, cuatriciclos en la selva, bungee jumping, visitas VIP a Chichén Itzá), traslados de lujo, y armamos viajes completos personalizados para nuestros clientes. Nos diferenciamos porque siempre tenemos planes alternativos para días de lluvia (spa maya, cata de tequilas, cenotes techados, clases de cocina). El servicio es premium y se ofrece a turistas de todo el mundo.

---

## REQUERIMIENTOS TÉCNICOS

- **Framework**: React + Vite (o Next.js si preferís SSR/SEO)
- **Styling**: Tailwind CSS o CSS Modules — diseño luxury, NO genérico
- **Idiomas**: El sitio DEBE ser bilingüe **Español / Inglés** con un toggle de idioma visible en el navbar. El idioma por defecto debería detectarse del navegador del usuario (si es "es" → español, sino → inglés). El usuario puede cambiar manualmente en cualquier momento y la preferencia debe persistir (localStorage).
- **Responsive**: Mobile-first, debe verse perfecto en celulares, tablets y desktop
- **Animaciones**: Scroll-triggered fade-ins, hover effects en cards, transiciones suaves
- **Despliegue**: Listo para deploy en Replit / Vercel / Netlify

---

## ESTRUCTURA DE PÁGINAS / SECCIONES

### 1. NAVBAR (sticky, con blur backdrop)
- Logo: "RIVIERA" con subtítulo "Cancún Premium" (símbolo ✦)
- Links: Experiencias, Nosotros, Testimonios, Contacto
- **Toggle de idioma** (banderita o botón ES / EN) visible y accesible
- Botón CTA "Reservar Ahora" / "Book Now" que scrollea al formulario
- Menú hamburguesa en mobile

### 2. HERO (full viewport)
- Background: gradiente azul profundo → océano (#0A1628 → #0E4D64)
- Headline grande con tipografía serif de lujo (Playfair Display o similar)
  - ES: "Tu aventura premium comienza acá"
  - EN: "Your premium adventure starts here"
- Subtítulo descriptivo del servicio
- Dos botones CTA: "Explorar Experiencias" / "Explore Experiences" + "Armá Tu Viaje" / "Plan Your Trip"
- Strip de estadísticas: 2,500+ viajeros, 98% satisfacción, 15+ excursiones, soporte 24/7
- Elemento visual decorativo (puede ser imagen hero de Cancún, o composición gráfica)
- Wave divider al fondo

### 3. SOBRE NOSOTROS
- Título: "No vendemos excursiones. Creamos experiencias." / "We don't sell tours. We create experiences."
- Texto explicando: +10 años en la Riviera Maya, viaje personalizado de punta a punta, traslados, excursiones, gastronomía, planes para lluvia
- Grilla de íconos con servicios: Yates, Cuatriciclos, Bungee, Chichén Itzá, Snorkel, Planes Lluvia
- Checkmarks: viaje personalizado, soporte 24/7 bilingüe, planes para lluvia

### 4. EXCURSIONES (sección principal)
- **Filtros por categoría** en tabs/pills: Todas, Aventura, Relax & Confort, Cultural
- **6 tarjetas de excursiones** en grid responsive (3 cols desktop, 1 col mobile):

**Excursión 1 — Yate Privado Premium** (tag: MÁS VENDIDO / BEST SELLER)
- Día exclusivo en yate de lujo, barra libre, snorkel en arrecifes, atardecer en alta mar
- Capacidad hasta 12 personas
- Incluye: barra libre premium, chef a bordo, equipo de snorkel, DJ opcional
- Desde USD $1,200 | 6-8 horas

**Excursión 2 — Cuatriciclos en la Selva** (tag: AVENTURA / ADVENTURE)
- Recorrido off-road por selva virgen con paradas en cenotes secretos
- Guía experto bilingüe y equipo completo de seguridad
- Incluye: cenote privado, guía bilingüe, fotos incluidas, equipo completo
- Desde USD $180 | 3-4 horas

**Excursión 3 — Bungee Jumping Extremo** (tag: EXTREMO / EXTREME)
- Salto desde 45 metros con vista panorámica al mar turquesa
- Certificación internacional de seguridad
- Incluye: video HD, certificación internacional, fotos profesionales, seguro
- Desde USD $150 | 1-2 horas

**Excursión 4 — Chichén Itzá VIP** (tag: CULTURAL)
- Acceso temprano exclusivo a la pirámide de Kukulkán
- Guía arqueólogo privado, almuerzo gourmet en hacienda colonial, cenote sagrado
- Incluye: acceso temprano, arqueólogo privado, almuerzo gourmet, cenote sagrado
- Desde USD $350 | Día completo / Full day

**Excursión 5 — Traslados VIP** (tag: CONFORT / COMFORT)
- Vehículos de lujo con WiFi, bebidas frías, chofer profesional
- Aeropuerto, hotel, excursiones — todos los tramos cubiertos
- Incluye: WiFi a bordo, bebidas, chofer bilingüe, disponible 24/7
- Desde USD $80 | Según destino / Varies

**Excursión 6 — Día de Lluvia Premium** (tag: PLAN B)
- Spa maya ancestral, cata de tequilas y mezcales, cocina mexicana con chef privado, cenotes techados
- Incluye: spa maya, cata premium, clase de cocina, cenote techado
- Desde USD $220 | 4-6 horas

- Cada tarjeta al hacer click abre un **modal con detalle completo** (descripción extendida, features con chips, precio, duración, botón "Reservar Esta Experiencia" que lleva al form)

### 5. BANNER "PLAN B — DÍAS DE LLUVIA"
- Sección destacada con fondo gradiente oscuro
- Mensaje: "¿Día de lluvia? Tenemos Plan B." / "Rainy day? We've got Plan B."
- Explicar que el clima tropical es impredecible pero siempre hay alternativas increíbles
- CTA hacia contacto

### 6. TESTIMONIOS
- 3 tarjetas con reseñas:
  - María G. (Buenos Aires, AR) — 5 estrellas — sobre el yate
  - Carlos & Ana (Madrid, ES) — 5 estrellas — sobre Chichén Itzá
  - James W. (New York, US) — 5 estrellas — sobre el plan de lluvia (este en inglés original)
- Estrellas doradas, comillas decorativas, diseño elegante

### 7. PROCESO "¿CÓMO FUNCIONA?" / "HOW IT WORKS?"
- 4 pasos numerados (01–04):
  1. Contanos tu idea / Tell us your idea
  2. Diseñamos tu viaje / We design your trip
  3. Confirmás y listo / Confirm and go
  4. Disfrutás al máximo / Enjoy to the fullest
- Diseño limpio con números grandes dorados

### 8. FORMULARIO DE CONTACTO
- Título: "Armemos tu viaje ideal" / "Let's plan your dream trip"
- Campos: Nombre, Email, Fecha estimada (date picker), Cantidad de personas (select), Mensaje/intereses (textarea)
- Botón: "Enviar Consulta ✦" / "Send Inquiry ✦"
- Nota debajo: respondemos en <24hs, sin compromiso, WhatsApp disponible

### 9. FOOTER
- Logo + descripción breve
- Columna de excursiones (links)
- Columna de contacto: email (info@rivieracancun.com), teléfono (+52 998 123 4567), WhatsApp, dirección (Cancún, Quintana Roo, México)
- Copyright 2026

### 10. ELEMENTOS FLOTANTES
- **Botón de WhatsApp** fijo abajo a la derecha, siempre visible, que abre wa.me/529981234567

---

## SISTEMA DE TRADUCCIÓN (i18n)

Implementar un sistema de traducción simple pero completo. Puede ser:
- Un Context de React con un JSON de traducciones por idioma
- O una librería como `react-i18next` si se prefiere

**Estructura sugerida del JSON de traducciones:**

```
{
  "es": {
    "nav.experiences": "Experiencias",
    "nav.about": "Nosotros",
    "nav.testimonials": "Testimonios",
    "nav.contact": "Contacto",
    "nav.book": "Reservar Ahora",
    "hero.title": "Tu aventura premium comienza acá",
    "hero.subtitle": "Excursiones exclusivas en yate, cuatriciclos, bungee jumping y expediciones culturales. Armamos tu viaje completo — y si llueve, tenemos un plan B espectacular.",
    "hero.cta1": "Explorar Experiencias",
    "hero.cta2": "Armá Tu Viaje",
    // ... etc para TODA la página
  },
  "en": {
    "nav.experiences": "Experiences",
    "nav.about": "About Us",
    "nav.testimonials": "Testimonials",
    "nav.contact": "Contact",
    "nav.book": "Book Now",
    "hero.title": "Your premium adventure starts here",
    "hero.subtitle": "Exclusive yacht excursions, ATV jungle rides, bungee jumping and cultural expeditions. We plan your entire trip — and if it rains, we have an amazing Plan B.",
    "hero.cta1": "Explore Experiences",
    "hero.cta2": "Plan Your Trip",
    // ... etc para TODA la página
  }
}
```

**IMPORTANTE**: Absolutamente TODOS los textos visibles en la página deben estar traducidos. No puede quedar ni un solo string hardcodeado. Los precios se mantienen en USD en ambos idiomas.

---

## PALETA DE COLORES

| Nombre     | Hex       | Uso                                      |
|------------|-----------|------------------------------------------|
| Gold       | #C9A84C   | Acentos, CTAs, highlights, líneas        |
| Deep Blue  | #0A1628   | Fondos oscuros, navbar, footer, textos   |
| Ocean      | #0E4D64   | Gradientes, fondos secundarios           |
| Sand       | #F5ECD7   | Fondos claros, secciones alternas        |
| White      | #FAFAF7   | Fondo principal                          |
| Coral      | #E07A5F   | Tags de "extremo", acentos secundarios   |

---

## TIPOGRAFÍA

- **Display / Títulos**: Playfair Display (serif, lujosa, con itálicas para énfasis en dorado)
- **Body / UI**: DM Sans (sans-serif, limpia, moderna)
- Google Fonts: `Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700` + `DM+Sans:wght@300;400;500;700`

---

## ESTÉTICA Y DISEÑO

- **Luxury tropical**: elegante pero cálido, no frío ni corporativo
- **Bordes redondeados** generosos (16px–24px en cards)
- **Sombras suaves** que dan profundidad sin ser pesadas
- **Gradientes** sutiles en fondos y elementos hero
- **Espaciado generoso** — que respire
- **Micro-interacciones**: hover en cards (lift + sombra), hover en botones (scale), links con underline animado
- **Scroll animations**: elementos que aparecen con fade-in al entrar al viewport (IntersectionObserver)
- **Pattern overlay** sutil en hero (dots o líneas a muy baja opacidad)
- **Wave SVG divider** entre hero y contenido
- **NO usar**: estética genérica de AI, gradientes violetas, Inter/Roboto/Arial, layouts predecibles

---

## NOTAS ADICIONALES

- Los precios son orientativos, mostrar siempre "Desde USD $X" / "From USD $X"
- El formulario por ahora puede ser frontend-only (sin backend), pero dejarlo preparado para conectar a un servicio (Formspree, EmailJS, o API propia)
- SEO básico: meta tags, Open Graph, título descriptivo
- Favicon con el símbolo ✦ en dorado sobre fondo azul
- Performance: imágenes optimizadas, lazy loading, código limpio
- Accesibilidad: alt texts, contraste adecuado, navegación por teclado
