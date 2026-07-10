# Mood Sense — Reglas del proyecto (obligatorias en todas las sesiones)

## Estilo de código

- **Nomenclatura en inglés** para todo el código (variables, funciones, tipos, rutas API, schema de DB). Español solo en copy/contenido de UI cuando se pida.
- Archivos: `kebab-case.ts(x)` para archivos, `PascalCase` para componentes React y tipos, `camelCase` para funciones/variables, `SCREAMING_SNAKE_CASE` para constantes y env vars.
- **Estructura feature-based** (App Router con route groups):
  - `app/(shop)/`, `app/(auth)/`, `app/(account)/`, `app/admin/` → páginas (solo composición de vistas).
  - `app/api/<dominio>/` → route handlers = controladores delgados (parsear request, llamar servicio, responder). Sin lógica de negocio.
  - `lib/<dominio>/` → lógica de negocio y servicios (precios, stock, checkout…). Aquí vive lo testeable.
  - `lib/validators/` → schemas Zod compartidos entre API y formularios.
  - `components/` → UI pura y reutilizable, sin acceso a datos. `components/ui/` es generado por shadcn: **no editar a mano**, regenerar con `npx shadcn@latest add <x>`.
  - `types/` → tipos compartidos.
- JSDoc obligatorio en funciones de negocio complejas (cálculo de precios, stock, checkout).
- Principios SOLID y DRY. Componentes pequeños y componibles.

## Patrones obligatorios

- **Validación Zod en todo input externo** (body, query params, form data) ANTES de tocar DB o servicios. Los schemas viven en `lib/validators/` y se reutilizan en cliente y servidor.
- **Tipado estricto: prohibido `any`** (usar `unknown` + narrowing). No desactivar reglas de ESLint sin justificación en comentario.
- **Server Components por defecto**; `"use client"` solo cuando hay interactividad/estado/browser APIs. Estado global de cliente (carrito, wishlist, filtros UI) → Zustand.
- **Manejo de errores centralizado**: `handleApiError` reutilizable en todos los route handlers (mapea ZodError→400, auth→401/403, not found→404, resto→500 sin filtrar detalles internos); error boundaries (`error.tsx`) en el frontend.
- Respuestas de API con forma consistente: `{ data }` en éxito, `{ error: { code, message } }` en fallo.
- **Dinero en centavos enteros** en DB, servicios y APIs (`priceCents`, `totalCents`…). Nunca floats ni decimales; formatear a moneda solo en la capa de presentación.
- Imágenes siempre con `next/image`. Listados con streaming/Suspense. Catálogo con ISR.

## Seguridad

- **Nunca commitear secretos**: todo secreto va en `.env` (gitignored); cada variable nueva se añade a `.env.example` con valor vacío o default local inocuo, en el mismo PR.
- Solo variables `NEXT_PUBLIC_*` pueden llegar al cliente; jamás exponer master keys (ej. Meilisearch usa search key pública, master key solo en servidor).
- Sanitizar/validar todo input con Zod; nunca interpolar input en queries (Prisma parametriza).
- Auth: JWT con expiración corta; contraseñas con bcrypt/argon2; verificación de rol **en el servidor** (middleware + verificación en cada handler/página admin — nunca confiar solo en UI).
- Webhooks de Stripe: verificar firma antes de procesar.

## Testing

- **Vitest** → unitarias de lógica de negocio en `lib/` (precios, descuentos, stock, validadores).
- **Playwright** → E2E solo de flujos críticos: checkout y auth.
- Obligatorio escribir/actualizar tests al tocar: cálculo de precios/descuentos, stock, checkout, auth/roles. Para el resto, tests razonables según riesgo.
- Un bug corregido = un test que lo cubra.

## Git

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:` (+ scope opcional: `feat(cart): ...`). Mensajes en inglés.
- No commitear código que no compile o no pase `npm run lint`.
- `CLAUDE.md` (y este archivo si hay convención nueva) se actualizan **en el mismo commit** que el cambio que los motiva.

## Proceso

- Trabajo por fases (0–7, ver CLAUDE.md): al terminar una fase, detenerse, resumir y esperar confirmación del usuario.
- Si un requerimiento implica mala práctica de seguridad/arquitectura, señalarlo y proponer la alternativa antes de implementar.
- Si una elección del stack no es óptima para un requisito nuevo, decirlo explícitamente antes de sustituirla.
