---
trigger: glob
description: "Paleta de marca, modos editorial/boutique y tipografía. Aplicar al editar UI o estilos."
globs: "app/**/*.tsx, components/**/*.tsx, app/globals.css"
---

# Design system (implementado en `app/globals.css`)

**Constantes de marca** (derivadas de los dos logotipos existentes — no inventar otra paleta):

| Token     | Hex       | Uso                                              |
| --------- | --------- | ------------------------------------------------ |
| `--cream` | `#F5F3EF` | fondo modo editorial (principal)                 |
| `--ink`   | `#111111` | texto/primario modo editorial                    |
| `--navy`  | `#0B1A33` | fondo modo boutique, footer, badges premium      |
| `--gold`  | `#C9A876` | acentos de lujo, ring de focus, texto sobre navy |

- **Modo editorial (por defecto, `:root`)**: crudo + negro, look revista de moda, mucho whitespace.
- **Modo boutique (`.dark`)**: navy + dorado, para secciones premium/campañas (variante "Dark/Lujo" del logo).
- **Tipografía** (`next/font/local`, archivos variable woff2 **self-hosted en `app/fonts/`** — ver decisión 17): `--font-serif` = **Playfair Display** (logotipo, titulares grandes, `font-serif`; incluye variante itálica); `--font-sans` = **Archivo** (navegación, slogans, microcopy en mayúsculas con tracking amplio, ej. `tracking-[0.25em] uppercase`); `--font-geist-mono` = Geist Mono (SKUs, datos tabulares).
- Clases utilitarias disponibles: `bg-navy`, `text-gold`, `bg-cream`, `text-ink`, etc.
