# Mood Sense — Web Store · Memoria del proyecto

> Este archivo es la memoria viva del proyecto. **Regla permanente:** al completar una fase, tomar una decisión de arquitectura, cambiar una dependencia o hacer cualquier ajuste relevante, actualizar este archivo (y `.claude/rules.md` si introduce una convención nueva) **en el mismo commit** del cambio — nunca en un commit separado posterior.

## Resumen del proyecto

**Mood Sense** es un e-commerce tipo _concept store multimarca_: curaduría transversal de ropa, calzado, gorras y accesorios de estilo urbano, streetwear premium y casual moderno, para hombre y mujer (público 18–35, mobile-first). Slogan oficial: **"Wear your vibe. Make the match."** · Tagline secundario: _"Curated multi-brand concept store · Head-to-toe style"_. Propuesta head-to-toe: armar un outfit completo y auténtico en un solo lugar. Referencia estructural de UX: bdgastore.com (solo estructura, no identidad).

## Stack tecnológico (instalado)

| Tecnología            | Versión     | Notas                                                                                                                                                                                                                                         |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js               | 15.5.20     | App Router, Turbopack, RSC                                                                                                                                                                                                                    |
| React                 | 19.1.0      |                                                                                                                                                                                                                                               |
| TypeScript            | ^5          | strict                                                                                                                                                                                                                                        |
| Tailwind CSS          | ^4          | tokens vía `@theme` en `app/globals.css`                                                                                                                                                                                                      |
| shadcn/ui             | CLI 4.13    | ⚠️ usa **Base UI** (`@base-ui/react`), NO Radix — cambio upstream del registry; misma cobertura ARIA. El componente `form` ya no existe: usar react-hook-form + zod directo                                                                   |
| Zod                   | ^4          | validación de todo input                                                                                                                                                                                                                      |
| ESLint 9 + Prettier 3 | flat config | `prettier-plugin-tailwindcss` activo                                                                                                                                                                                                          |
| Docker Compose        | —           | Postgres 16, Redis 7, Meilisearch v1.12                                                                                                                                                                                                       |
| Prisma                | 7.8         | ⚠️ major nuevo: config en `prisma.config.ts` (no en package.json), generator `prisma-client` emite el cliente a `lib/generated/prisma/` (gitignored, se regenera en `postinstall`), sin engine Rust — usa driver adapter `@prisma/adapter-pg` |
| Auth.js (next-auth)   | 5.0 beta    | JWT strategy, Prisma adapter, Credentials + Google (opcional por env)                                                                                                                                                                         |
| bcryptjs              | ^3          | hashing de contraseñas (cost 12), sin deps nativas                                                                                                                                                                                            |
| Vitest                | ^4          | unitarias de `lib/` (config en `vitest.config.ts`, tests colocados `*.test.ts`)                                                                                                                                                               |
| tsx                   | ^4          | runner del seed (`prisma db seed`) y scripts (`scripts/`); resuelve el alias `@/` de tsconfig                                                                                                                                                 |
| meilisearch (js)      | ^0.59       | ⚠️ la clase se llama `Meilisearch` y los errores `Meilisearch*` (minúscula «s», renombrado upstream — `MeiliSearch` ya no existe)                                                                                                             |

**Pendiente de instalar (fases siguientes):** Zustand, Stripe SDK, ioredis, Playwright, Vercel Blob.

**Deuda/avisos conocidos:**

- `npm audit`: postcss transitivo dentro de next (XSS moderado, no aplicable a nuestro uso, sin fix real). Revisar al actualizar Next.
- ~~Docker Desktop no estaba instalado en la máquina al cierre de Fase 0~~ — resuelto: Docker funciona y los 3 contenedores levantan (ver «Entorno local y troubleshooting»).
- Healthcheck de `meilisearch` reporta "unhealthy" siendo un falso negativo (detalle en «Entorno local y troubleshooting»); decisión de ajustarlo o dejarlo, pendiente.

## Estado de fases

- [x] **Fase 0 — Setup del entorno** (commit `30d89df`): scaffold Next 15 + Tailwind v4 + shadcn/ui, ESLint/Prettier, docker-compose (Postgres/Redis/Meilisearch), `.env.example`, design tokens de marca, estructura de carpetas. ✅ Confirmado: Docker levanta los 3 contenedores y los servicios responden (ver nota sobre el healthcheck de Meilisearch en «Entorno local y troubleshooting»). Fase completa; el resto es contexto operativo.
- [x] **Fase 1 — Base de datos y autenticación**: `schema.prisma` completo (auth + catálogo + comercio: User/Account/Session, Brand, Category jerárquica, Product, ProductVariant, ProductImage, Address, Order/OrderItem con snapshot, WishlistItem), migración `init` aplicada, seed con 6 marcas / 10 categorías / 20 productos / 73 variantes / 2 usuarios (ver credenciales en «Comandos útiles»), Auth.js v5 (JWT, Credentials + Google opcional, endpoint register, middleware de rol en `/admin`), `handleApiError` centralizado, 13 tests unitarios (validadores + password). Verificado E2E vía curl: register 201/409/400, login, sesión con rol, gate ADMIN/USER en `/admin`.
- [x] **Fase 2 — Backend de catálogo**: `GET /api/products` (filtros: category —incluye hijas—, brand, gender, minPrice/maxPrice en centavos, onSale, featured; sort newest/price-asc/price-desc/name-asc; paginación page/perPage≤60), `GET /api/products/[slug]` (detalle PDP con brand, categoría+padre, imágenes, variantes; 404), `GET /api/categories` (árbol 2 niveles con productCount activo), `GET /api/brands` (con productCount), `GET /api/search` (Meilisearch: typo-tolerance, mismos filtros, sort por relevancia/precio/novedad). Solo productos `isActive` expuestos. Índice `products` con settings versionados en `lib/search/products-index.ts`, sync manual `npm run search:sync` (también crea la search key pública; el CRUD del admin lo disparará en Fase 6). 27 tests nuevos (40 total). Verificado E2E vía curl contra build de producción.
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
8. **Dinero siempre en centavos enteros** (`priceCents`, `totalCents`…): compatible con Stripe y sin errores de redondeo de flotantes. Convención obligatoria (ver rules.md).
9. **Sesiones JWT (no database sessions)** con config de Auth.js dividida: `lib/auth/auth.config.ts` es edge-safe (sin Prisma/bcrypt) y la usa el middleware; `lib/auth/index.ts` añade adapter y providers para el runtime Node. El rol viaja en el token (callbacks `jwt`/`session`) y se re-verifica en servidor.
10. **Pedidos con snapshot**: `Order`/`OrderItem` copian nombre, SKU, precio y dirección al momento de compra; las FK a catálogo son `SetNull` para que el historial sobreviva a borrados de productos.
11. **Búsqueda: Postgres filtra, Meilisearch busca.** `/api/products` (PLP con filtros exactos) va directo a Prisma; `/api/search` (texto libre + typo-tolerance) va a Meilisearch con documentos desnormalizados. Los filtros de Meili se construyen escapando valores con `JSON.stringify` (previene inyección en la sintaxis de filtro). El browser solo recibe la search key pública scoped al índice `products`; la master key nunca sale del servidor. Sync del índice manual por ahora (`npm run search:sync`), idempotente.

## Design system (implementado en `app/globals.css`)

**Constantes de marca** (derivadas de los dos logotipos existentes — no inventar otra paleta):

| Token     | Hex       | Uso                                              |
| --------- | --------- | ------------------------------------------------ |
| `--cream` | `#F5F3EF` | fondo modo editorial (principal)                 |
| `--ink`   | `#111111` | texto/primario modo editorial                    |
| `--navy`  | `#0B1A33` | fondo modo boutique, footer, badges premium      |
| `--gold`  | `#C9A876` | acentos de lujo, ring de focus, texto sobre navy |

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
npm run db:migrate       # prisma migrate dev (crear/aplicar migraciones)
npm run db:seed          # re-seed idempotente (limpia catálogo, upserta usuarios)
npm run db:generate      # regenerar cliente Prisma (también corre en postinstall)
npm run db:studio        # Prisma Studio
npm test                 # Vitest (unitarias de lib/) · test:watch para TDD
npm run search:sync      # reindexar Meilisearch (settings + productos + search key)
```

**Usuarios del seed (solo dev):** `admin@moodsense.dev` (ADMIN) y `cliente@moodsense.dev` (USER); contraseñas por defecto `admin1234` / `cliente1234`, sobreescribibles con `SEED_ADMIN_PASSWORD` / `SEED_USER_PASSWORD`.

## Entorno local y troubleshooting

**Ubicación del proyecto — WSL nativo (2026-07-10).** El proyecto se movió de Windows (`C:\Users\Admin\Documents\Desarrollo`) al filesystem nativo de WSL (`~/projects/moodsense-web-store`). La migración se hizo mediante **clone limpio por SSH**, no por copia directa entre filesystems, para evitar problemas de permisos y de performance de I/O entre NTFS y ext4. El path de Windows queda obsoleto: no trabajar desde ahí.

**Node.js — usar exclusivamente el de nvm (Linux).** El entorno requiere Node.js nativo de Linux instalado vía **nvm (v22)**. NO usar el Node de Windows ni el de apt/Ubuntu: mezclar cualquiera de esos provoca errores de rutas UNC o conflictos de PATH. Verificación rápida:

```bash
which node   # debe apuntar a ~/.nvm/versions/node/...
```

Si no apunta ahí, correr `nvm use 22` o revisar que `~/.bash_profile` cargue `~/.bashrc` (donde nvm se inicializa).

**PostgreSQL de apt deshabilitado (2026-07-10).** Ubuntu (WSL) tenía `postgresql-16` de apt corriendo en el puerto 5432, **tapando el puerto publicado del contenedor Docker**: las conexiones desde WSL fallaban con `P1000 Authentication failed` aunque el contenedor estaba sano. Se deshabilitó con `sudo systemctl disable --now postgresql postgresql@16-main` (el paquete sigue instalado). Si tras reiniciar WSL reaparece un P1000/ECONNREFUSED en 5432: verificar `ss -tln | grep 5432` (no debe haber listener de apt) y hacer `docker compose restart postgres` para que Docker Desktop restablezca el forward del puerto hacia la distro.

**npm 12 bloquea install scripts nuevos.** Al instalar paquetes con scripts de instalación (prisma, esbuild, sharp…), npm los bloquea hasta aprobarlos: `npm install-scripts approve <pkg>` + `npm rebuild <pkg>`. Los aprobados quedan registrados en `package.json` (clave `allowScripts`).

**Healthcheck de Meilisearch — falso negativo conocido.** El servicio `meilisearch` de `docker-compose.yml` aparece como **"unhealthy"** en `docker compose ps` aunque funciona correctamente (confirmado vía `curl http://localhost:7700/health` desde el host). Es un falso negativo relacionado a cómo `wget` resuelve `localhost` dentro del propio contenedor. **Pendiente de decisión:** ajustar el healthcheck (ej. usar `127.0.0.1` en vez de `localhost`) o dejarlo así; no bloquea el desarrollo. Mientras tanto, ignorar ese estado y validar con el `curl` anterior si hay dudas.

## Convenciones del proyecto

Reglas obligatorias de estilo, patrones, seguridad, testing y git (cargadas automáticamente en cada sesión vía import):

@.claude/rules.md
