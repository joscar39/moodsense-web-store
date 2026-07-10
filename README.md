# Mood Sense — Web Store

> **Wear your vibe. Make the match.**
> Curated multi-brand concept store · Head-to-toe style

E-commerce de Mood Sense: concept store multimarca de ropa, calzado, gorras y accesorios de estilo urbano, streetwear premium y casual moderno.

## Stack

| Capa           | Tecnología                                                            |
| -------------- | --------------------------------------------------------------------- |
| Frontend       | Next.js 15 (App Router) · TypeScript · React Server Components        |
| UI             | Tailwind CSS v4 · shadcn/ui (Base UI primitives)                      |
| Estado cliente | Zustand                                                               |
| Backend        | Next.js Route Handlers (`app/api/**`) — monolito modular por dominios |
| Base de datos  | PostgreSQL · Prisma ORM                                               |
| Cache/sesión   | Redis (local vía Docker; Upstash en producción)                       |
| Auth           | Auth.js (NextAuth v5) — credenciales + Google OAuth, JWT              |
| Pagos          | Stripe (Checkout Sessions + Webhooks)                                 |
| Imágenes       | Vercel Blob                                                           |
| Búsqueda       | Meilisearch (Docker)                                                  |
| Validación     | Zod                                                                   |
| Testing        | Vitest · Playwright                                                   |

## Estructura

```
app/
  (shop)/      → storefront: home, PLP, PDP, cart, checkout
  (auth)/      → login, registro, recuperación de contraseña
  (account)/   → perfil, pedidos, direcciones, wishlist
  admin/       → panel administrativo (rol ADMIN)
  api/         → route handlers por dominio (products, orders, auth, cart, checkout)
components/    → UI pura (components/ui = shadcn, no editar a mano)
lib/           → lógica de negocio, servicios y validadores Zod
types/         → tipos compartidos
```

## Setup local

Requisitos: Node 20+, npm, **Docker Desktop** (con WSL2 en Windows).

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp .env.example .env   # y completa los valores vacíos

# 3. Infraestructura local (Postgres, Redis, Meilisearch)
docker compose up -d

# 4. App
npm run dev            # http://localhost:3000
```

Servicios locales:

- PostgreSQL → `localhost:5432` (user/pass/db: `moodsense`)
- Redis → `localhost:6379`
- Meilisearch → `http://localhost:7700` (master key en `.env.example`)

## Scripts

| Comando                | Descripción              |
| ---------------------- | ------------------------ |
| `npm run dev`          | Dev server con Turbopack |
| `npm run build`        | Build de producción      |
| `npm run lint`         | ESLint                   |
| `npm run format`       | Prettier (write)         |
| `npm run format:check` | Prettier (check)         |

## Notas

- `npm audit` reporta un `postcss` transitivo dentro de `next` (XSS moderado en stringify de CSS). No aplica a nuestro uso y no existe fix sin downgrade mayor; se revisará al actualizar Next.
