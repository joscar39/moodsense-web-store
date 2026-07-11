# Mood Sense — Especificación técnica de assets visuales de marca

> Referencia interna (desarrollador). Inventario de cada punto del sitio donde vive
> un asset de marca hoy como texto/placeholder, con el archivo exacto, las
> dimensiones que espera el layout real (clases Tailwind verificadas) y el formato
> recomendado. La versión para el diseñador (sin jerga técnica) es
> `docs/brief-diseno-mood-sense.pdf`.

Modos de color relevantes: **editorial** (default, fondo `--cream #F5F3EF`, texto `--ink #111111`)
y **boutique** (`.dark`, fondo `--navy #0B1A33`, acentos `--gold #C9A876`). Un asset que aparezca
en ambos contextos necesita variante clara y oscura.

---

## 1. Logotipo

Hoy el logotipo es **texto renderizado** ("Mood _Sense_", Playfair Display, itálica en "Sense"),
no una imagen. Al recibir el SVG definitivo, se sustituye el texto por `next/image`/SVG inline.

| Ubicación                        | Archivo / componente                                                                | Contexto de color                              | Caja disponible (real)                                                          | Recomendación                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Header (todas las páginas)       | `components/layout/site-header.tsx` (link con `font-serif text-2xl`)                | Claro (header `bg-background` = cream; sticky) | Alto útil ≈ **32–40 px** dentro de header `h-16` (64 px); ancho libre ≤ ~200 px | **SVG horizontal**, versión tinta (`#111111`) sobre claro                   |
| Footer                           | `components/layout/site-footer.tsx` (`font-serif text-3xl`, sección `dark bg-navy`) | **Oscuro** (navy)                              | Alto ≈ **36–44 px**, ancho libre                                                | **SVG horizontal**, versión clara/dorada (`#F5F3EF` o `#C9A876`) sobre navy |
| Menú móvil (Sheet)               | `components/layout/mobile-nav.tsx` (`SheetTitle`, `text-2xl`)                       | Claro                                          | Alto ≈ 32 px, ancho ≤ 240 px                                                    | Reusa SVG claro                                                             |
| Páginas de auth (login/registro) | `app/(auth)/layout.tsx` (`text-3xl`)                                                | Claro                                          | Alto ≈ 36–44 px, centrado                                                       | Reusa SVG claro                                                             |

**Entregables logo:** SVG maestro (horizontal) en 2 variantes (fondo claro / fondo oscuro) + versión
compacta/monograma para espacios angostos (ver favicon).

## 2. Favicon e íconos de app

Estado actual: `app/favicon.ico` es el **default de Next.js** (4 íconos: 16×16 y 32×32, 32 bpp).
No hay `manifest`/PWA configurado (`app/manifest.ts` no existe) ni `apple-icon`.

Convención de archivos de Next.js App Router (basta con colocarlos en `app/`):

| Archivo                    | Dimensiones exactas                           | Formato                               |
| -------------------------- | --------------------------------------------- | ------------------------------------- |
| `app/favicon.ico`          | 16×16 + 32×32 + 48×48 (multi-size en un .ico) | ICO                                   |
| `app/icon.svg`             | vectorial (cuadrado)                          | SVG                                   |
| `app/icon.png`             | 32×32                                         | PNG                                   |
| `app/apple-icon.png`       | **180×180**                                   | PNG (fondo sólido, sin transparencia) |
| `app/manifest.ts` + íconos | **192×192** y **512×512**                     | PNG (cuando se configure PWA)         |

Diseño requerido: **monograma/isotipo simplificado** legible a 16×16 (el logotipo completo no escala).

## 3. Open Graph / redes sociales

`app/layout.tsx` define `title` (template `%s · Mood Sense`) y `description`, **sin imagen OG ni
twitter card configuradas**. Al recibir el asset se añade por convención de archivo:

| Archivo                                                | Dimensiones exactas         | Formato          |
| ------------------------------------------------------ | --------------------------- | ---------------- |
| `app/opengraph-image.png` (global)                     | **1200×630** (ratio 1.91:1) | PNG o JPG ≤ 1 MB |
| `app/twitter-image.png` (opcional, puede ser el mismo) | 1200×630                    | PNG/JPG          |

Zona segura: logo + slogan centrados, margen ≥ 80 px (recortes en previews de apps).

## 4. Hero de la Home

`components/home/hero.tsx` — hoy es **100 % tipográfico** (sin imagen), sección `border-b` con
padding `py-24/32`. Si se incorpora imagen de campaña será fondo full-width detrás del texto
(overlay de texto centrado):

| Variante             | Dimensiones                                 | Notas                                                                |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| Desktop (panorámica) | **2880×1200** (mín. 1920×800), ratio ~2.4:1 | Centro visual despejado para el slogan (texto se superpone centrado) |
| Móvil (vertical)     | **1080×1350** (4:5)                         | Mismo tratamiento, safe-zone central                                 |

Formato: **WebP** (o JPG calidad 80+). Debe funcionar bajo texto `--ink` sobre zonas claras
(o preparar variante con velo/gradiente).

## 5. Tiles de categoría (Home)

`components/home/category-tiles.tsx` — tarjetas `aspect-[4/3]` con borde, hoy solo texto.
Render real: grid de 4 columnas en `max-w-7xl` → cada tile ≈ **296×222 px** en desktop
(1 columna a ancho completo ≈ 640 px en móvil).

- Si se añaden fotos de categoría: **800×600** (4:3), WebP/JPG, 4 imágenes (Ropa, Calzado,
  Gorras, Accesorios). Deben tolerar el hover que invierte a fondo oscuro (o entregarse
  con overlay propio).

## 6. Banda boutique (Home)

`components/home/boutique-band.tsx` — sección full-width en modo `dark` (navy + dorado),
hoy tipográfica. Imagen de fondo opcional: **2880×900** (desktop) / **1080×1080** (móvil),
tratamiento oscuro (debe convivir con texto dorado/crema encima).

## 7. Imágenes de producto

Placeholders actuales: URLs de `placehold.co` **900×1200** sembradas en `prisma/seed.ts`
(750–1200 px reales). `next.config.ts` permite el host `placehold.co` en `images.remotePatterns`
(se añadirá el host definitivo — Vercel Blob — al configurarlo).

Ratio del sistema completo: **3:4 (vertical)** en todos los componentes:

| Componente              | Archivo                                                | Render real (desktop) | `sizes`                                                 |
| ----------------------- | ------------------------------------------------------ | --------------------- | ------------------------------------------------------- |
| Card PLP/grids          | `components/catalog/product-card.tsx` (`aspect-[3/4]`) | ≈ 296×395 px (4 col.) | `(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw` |
| Galería PDP (principal) | `components/pdp/product-gallery.tsx` (`aspect-[3/4]`)  | ≈ 608×811 px (50 vw)  | `(max-width:1024px) 100vw, 50vw`                        |
| Thumbnails PDP          | ídem (`w-20 aspect-[3/4]`)                             | 80×107 px             | `80px`                                                  |
| Mini carrito            | `components/cart/cart-view.tsx` (`w-24 aspect-[3/4]`)  | 96×128 px             | `96px`                                                  |

**Especificación de fotografía de producto:** archivos maestros **1600×2133** (mín. 1200×1600),
ratio 3:4 exacto, JPG/WebP calidad 80+, fondo neutro consistente (idealmente crudo `#F5F3EF`
para integrarse con `bg-secondary`), 2+ tomas por producto (frontal + detalle/espalda).

## 8. Sin asset requerido (texto/CSS puro)

- Badges de descuento/agotado/estado: `components/catalog/product-card.tsx`,
  `components/account/order-status-badge.tsx` (texto + tokens de color).
- Botones, navegación, footer links: tipografía del design system.

## Resumen de entregables (checklist)

- [ ] Logo horizontal SVG — variante clara y oscura
- [ ] Monograma/isotipo SVG + favicon.ico (16/32/48) + apple-icon 180×180 + PNG 192/512
- [ ] Imagen OG 1200×630
- [ ] Hero desktop 2880×1200 + móvil 1080×1350 (opcional fase visual)
- [ ] 4 imágenes de categoría 800×600 (opcional)
- [ ] Fondo banda boutique 2880×900 (opcional)
- [ ] Fotografía de producto 1600×2133 (3:4), 2+ por producto
