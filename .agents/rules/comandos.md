---
trigger: model_decision
description: "Comandos npm/docker del proyecto (dev, build, lint, tests, migraciones, seed, búsqueda, E2E) y usuarios del seed. Leer al ejecutar comandos del proyecto."
---

# Comandos útiles

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
npm run search:sync      # reindexar Meilisearch (settings + productos)
node docs/render-pdfs.mjs <nombre>   # regenerar docs/<nombre>.pdf desde docs/sources/<nombre>.html (Chromium de Playwright)
npm run test:e2e         # Playwright: re-seed + build + E2E (auth/checkout); docker compose arriba
```

**Usuarios del seed (solo dev):** `admin@moodsense.dev` (ADMIN) y `cliente@moodsense.dev` (USER); contraseñas por defecto `admin1234` / `cliente1234`, sobreescribibles con `SEED_ADMIN_PASSWORD` / `SEED_USER_PASSWORD`.
