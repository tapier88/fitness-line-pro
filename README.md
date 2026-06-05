# Fitness Line Pro

Sitio web estatico premium para Fitness Line Pro, enfocado en catalogo de fajas colombianas, filtros por categoria, detalle de producto, carrito local y finalizacion de pedidos por WhatsApp.

## Tecnologias

- HTML5 semantico.
- CSS3 con variables, responsive design, animaciones sutiles y soporte para `prefers-reduced-motion`.
- JavaScript vanilla para catalogo, filtros, carrito, busqueda, rutas internas y modales.
- Datos de catalogo en `catalog-data.js`.
- Node.js para validacion, build y preview.
- Vercel como plataforma de despliegue.

## Requisitos

- Node.js 18 o superior.
- npm 9 o superior.
- Git para control de versiones.
- Vercel CLI si se despliega desde terminal.

## Instalacion

```bash
npm install
```

## Ejecucion local

Servir archivos fuente:

```bash
npm run start
```

Servir build de produccion:

```bash
npm run build
npm run preview
```

Por defecto el servidor local queda disponible en `http://localhost:4173`.

## Scripts

- `npm run lint`: valida SEO tecnico basico, archivos enlazados, imagenes, anchors, accesibilidad de botones y posibles secretos.
- `npm run build`: limpia y genera `dist/` con los archivos necesarios para produccion.
- `npm run preview`: sirve la carpeta `dist/`.
- `npm run start`: sirve la carpeta fuente para revision rapida.
- `npm test`: ejecuta validacion y build.

## Estructura

```text
.
|-- components/
|   `-- AnimatedShowcaseWindows.js
|-- imagenes/
|   |-- *.webp
|   |-- *.png
|   `-- payment-cash.svg
|-- scripts/
|   |-- build.js
|   |-- preview.js
|   `-- validate-site.js
|-- app.js
|-- catalog-data.js
|-- index.html
|-- package.json
|-- robots.txt
|-- sitemap.xml
|-- style.css
|-- vercel.json
`-- README.md
```

Los archivos Markdown numerados son documentacion interna de referencia y no se copian al build de produccion.

## Catalogo y navegacion

- El catalogo se renderiza desde `catalog-data.js`.
- Los filtros principales usan slugs de categorias.
- Las rutas internas actualizan `vista`, `categoria` y el hash para mantener navegacion directa al catalogo.
- El carrito se guarda en `localStorage`.
- El checkout genera un mensaje de WhatsApp con productos, cantidades y subtotal.

## Optimizacion y accesibilidad

- Imagenes principales con dimensiones declaradas y prioridad cuando son visibles above-the-fold.
- Imagenes secundarias con `loading="lazy"` y `decoding="async"`.
- Botones icon-only con `aria-label`.
- Estados `focus-visible` para navegacion con teclado.
- Animaciones reducidas automaticamente con `prefers-reduced-motion`.
- Headers de cache y seguridad configurados en `vercel.json`.

## Build de produccion

```bash
npm run test
```

El build copia a `dist/`:

- HTML, CSS, JavaScript y datos del catalogo.
- Assets locales referenciados por la pagina.
- `robots.txt`, `sitemap.xml` y `vercel.json`.

## Despliegue en Vercel

Configuracion recomendada:

- Framework preset: `Other`.
- Install command: `npm install`.
- Build command: `npm run build`.
- Output directory: `dist`.

No se requieren variables de entorno.

## Notas para futuros desarrolladores

- No modificar productos, precios o imagenes principales sin validar contra la fuente comercial.
- Mantener cambios visuales dentro del sistema de variables y clases existentes.
- Ejecutar `npm run test` antes de publicar.
- Revisar manualmente catalogo, carrito, busqueda, modal de producto, WhatsApp y responsive antes de produccion.
- No subir `.env`, tokens, claves privadas ni archivos temporales.
