# Mood Sense — Web Store · Memoria del proyecto

> Este archivo es la memoria viva del proyecto. **Regla permanente:** al completar una fase, tomar una decisión de arquitectura, cambiar una dependencia o hacer cualquier ajuste relevante, actualizar este archivo (y `.claude/rules.md` si introduce una convención nueva) **en el mismo commit** del cambio — nunca en un commit separado posterior.

## Resumen del proyecto

**Mood Sense** es un e-commerce tipo *concept store multimarca*: curaduría transversal de ropa, calzado, gorras y accesorios de estilo urbano, streetwear premium y casual moderno, para hombre y mujer (público 18–35, mobile-first). Slogan oficial: **"Wear your vibe. Make the match."** · Tagline secundario: *"Curated multi-brand concept store · Head-to-toe style"*. Propuesta head-to-toe: armar un outfit completo y auténtico en un solo lugar. Referencia estructural de UX: bdgastore.com (solo estructura, no identidad).

## Stack tecnológico (instalado)

| Tecnología | Versión | Notas |
| --- | --- | --- |
| Next.js | 15.5.20 | App Router, Turbopack, RSC |
| React | 19.1.0 | |
| TypeScript | ^5 | strict |
| Tailwind CSS | ^4 | tokens vía `@theme` en `app/globals.css` |
| shadcn/ui | CLI 4.13 | ⚠️ usa **Base UI** (`@base-ui/react`), NO Radix — cambio upstream del registry; misma cobertura ARIA. El componente `form` ya no existe: usar react-hook-form + zod directo |
| Zod | ^4 | validación de todo input |
| ESLint 9 + Prettier 3 | flat config | `prettier-plugin-tailwindcss` activo |
| Docker Compose | — | Postgres 16, Redis 7, Meilisearch v1.12 |

**Pendiente de instalar (fases siguientes):** Prisma, Auth.js (NextAuth v5), Zustand, Stripe SDK, ioredis, meilisearch-js, Vitest, Playwright, Vercel Blob.

**Deuda/avisos conocidos:**
- `npm audit`: postcss transitivo dentro de next (XSS moderado, no aplicable a nuestro uso, sin fix real). Revisar al actualizar Next.
- Docker Desktop no estaba instalado en la máquina al cierre de Fase 0 — requisito para Fase 1.

## Estado de fases

- [x] **Fase 0 — Setup del entorno** (commit `30d89df`): scaffold Next 15 + Tailwind v4 + shadcn/ui, ESLint/Prettier, docker-compose (Postgres/Redis/Meilisearch), `.env.example`, design tokens de marca, estructura de carpetas. *Pendiente de la fase: confirmación del usuario de que Docker levanta los 3 contenedores.*
- [ ] **Fase 1 — Base de datos y autenticación**: `schema.prisma` completo, migraciones, seed (~20 productos con variantes), Auth.js.
- [ ] **Fase 2 — Backend de catálogo**: endpoints products/categories/brands, filtros, Meilisearch, Zod.
- [ ] **Fase 3 — Storefront: Home + PLP + PDP** con design system de marca.
- [ ] **Fase 4 — Carrito y checkout**: Zustand, Stripe Checkout + Webhooks, stock.
- [ ] **Fase 5 — Cuenta de usuario**: perfil, direcciones, pedidos, wishlist.
- [ ] **Fase 6 — Panel admin**: CRUD + dashboard de ventas (rol ADMIN).
- [ ] **Fase 7 — Pulido final**: SEO técnico, Vitest + Playwright, performance, a11y, deploy Vercel + Neon.

**Flujo de trabajo acordado:** al terminar cada fase, detenerse, resumir y esperar confirmación del usuario antes de continuar.

## Decisiones de arquitectura

1. **Backend como monolito modular en Next.js Route Handlers** (`app/api/**` por dominios) en vez de un servicio aparte (NestJS/Express): un solo deploy en Vercel, comparte tipos y validadores Zod con el frontend, y el tamaño del proyecto no justifica infraestructura separada.
2. **Estructura feature-based con route groups**: `app/(shop)`, `app/(auth)`, `app/(account)`, `app/admin`, `app/api`. Separación estricta: `lib/` = lógica de negocio/servicios, `app/api/` = controladores, `components/` = UI pura, `page.tsx` = composición.
3. **Base UI en lugar de Radix**: shadcn v4 migró upstream; forzar Radix implicaría fijar registry antiguo. Se mantiene Base UI (mismo equipo, misma a11y).
4. **Vercel Blob para imágenes** (vs Cloudinary): setup local más simple y misma plataforma de deploy.
5. **Redis local vía Docker en dev, Upstash en producción**: el cliente se conecta por `REDIS_URL`, intercambiable.
6. **Tailwind v4 con tokens CSS** (`@theme` en `globals.css`) en vez de `tailwind.config`: es el estándar de Tailwind 4 y shadcn v4.
7. **Prisma + PostgreSQL** (Fase 1): relacional por integridad de pedidos/stock; Neon en producción.

## Design system (implementado en `app/globals.css`)

**Constantes de marca** (derivadas de los dos logotipos existentes — no inventar otra paleta):

| Token | Hex | Uso |
| --- | --- | --- |
| `--cream` | `#F5F3EF` | fondo modo editorial (principal) |
| `--ink` | `#111111` | texto/primario modo editorial |
| `--navy` | `#0B1A33` | fondo modo boutique, footer, badges premium |
| `--gold` | `#C9A876` | acentos de lujo, ring de focus, texto sobre navy |

- **Modo editorial (por defecto, `:root`)**: crudo + negro, look revista de moda, mucho whitespace.
- **Modo boutique (`.dark`)**: navy + dorado, para secciones premium/campañas (variante "Dark/Lujo" del logo).
- **Tipografía** (next/font): `--font-serif` = **Playfair Display** (logotipo, titulares grandes, `font-serif`); `--font-sans` = **Archivo** (navegación, slogans, microcopy en mayúsculas con tracking amplio, ej. `tracking-[0.25em] uppercase`); `--font-geist-mono` = Geist Mono (SKUs, datos tabulares).
- Clases utilitarias disponibles: `bg-navy`, `text-gold`, `bg-cream`, `text-ink`, etc.

## Comandos útiles

```bash
npm run dev              # dev server (Turbopack) → http://localhost:3000
npm run build            # build de producción
npm run lint             # ESLint
npm run format           # Prettier write · format:check para CI
docker compose up -d     # Postgres :5432 · Redis :6379 · Meilisearch :7700
docker compose ps        # verificar healthchecks
cp .env.example .env     # primera vez; completar claves vacías
npx shadcn@latest add X  # añadir componente shadcn (nunca editar components/ui a mano)
```

Migraciones/seed y tests: se documentarán aquí al implementarse (Fase 1 y 7).

## Convenciones del proyecto

Reglas obligatorias de estilo, patrones, seguridad, testing y git (cargadas automáticamente en cada sesión vía import):

@.claude/rules.md
