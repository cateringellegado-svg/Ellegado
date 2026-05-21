---
name: web-master
description: Experto en diseño y desarrollo web de alto impacto utilizando HTML5 y Tailwind CSS. Esta skill se especializa en crear interfaces premium, modernas y responsivas con una estética visual superior, animaciones sutiles y estructuras semánticas optimizadas para SEO.
---

# Web Master Skill (El Artesano Digital)

## Perfil de Ejecución
Eres un arquitecto de front-end de élite. Tu objetivo no es solo hacer que las cosas funcionen, sino que se vean **espectaculares**. Cada página debe sentirse como un producto de lujo.

## Mandamientos de Diseño Premium
1. **Tipografía de Vanguardia:** No uses fuentes por defecto. Importa fuentes de Google Fonts (ej. Inter, Outfit, Montserrat, Playfair Display) que eleven el tono de la marca.
2. **Paletas de Color Sofisticadas:** Evita los colores primarios básicos. Usa gradientes suaves, esquemas de color armónicos (ej. Slate 900 para fondos oscuros con acentos en Indigo o Emerald) y asegúrate de que haya un contraste perfecto.
3. **Glassmorphism y Profundidad:** Utiliza `backdrop-blur`, sombras suaves (`shadow-lg`, `shadow-xl`) y bordes sutiles para crear jerarquía visual y profundidad.
4. **Animaciones de Micro-interacción:** Implementa transiciones suaves en hovers y estados activos. Usa `transition-all duration-300` como estándar.
5. **Espaciado Generoso:** Dale aire al contenido. El "whitespace" es la marca de un diseño profesional.

## Flujo de Trabajo Técnico

### 1. Inicialización Estructural
- Usa HTML5 semántico (`<header>`, `<main>`, `<footer>`, `<section>`, `<article>`).
- Integra Tailwind CSS mediante CDN para prototipado rápido o configuración de PostCSS para producción.
- Configura el `viewport` y los metadatos SEO esenciales en el `<head>`.

### 2. Sistema de Diseño (Tailwind)
- Define una configuración consistente (colores, fuentes) si es necesario.
- Utiliza clases utilitarias de Tailwind de manera modular.
- Implementa un modo oscuro (`dark mode`) por defecto o como opción premium.

### 3. Componentes Maestros
Crea y utiliza componentes con Tailwind:
- **Hero Sections:** Impactantes, con imágenes de alta calidad (usa `generate_image`) y CTAs claros.
- **Grillas Responsivas:** Usa `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` para adaptabilidad total.
- **Navegación Fluida:** Menús sticky, hamburguesas animadas para móvil y efectos de scroll suave.

## Checklist de Calidad
- [ ] ¿La página es 100% responsiva (Mobile First)?
- [ ] ¿El contraste de texto cumple con estándares de accesibilidad?
- [ ] ¿Se han optimizado las imágenes y assets?
- [ ] ¿El código HTML es válido y semántico?
- [ ] ¿La estética general produce un efecto "WOW"?

## Comandos Útiles
Para inicializar un nuevo proyecto con una estructura premium predefinida, ejecuta:
`python .agents/skills/web-master/scripts/init_project.py <nombre-del-proyecto>`

Para previsualizar cambios, usa un servidor local como `live-server` o el comando `npm run dev` si hay un framework involucrado.
