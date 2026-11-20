# Deploy a producción — Vercel + Neon (guía paso a paso)

> Estos pasos requieren cuentas propias del usuario; el código ya está listo.
> Tiempo estimado: 30–45 min la primera vez.

## 1. Base de datos — Neon

1. Crear cuenta/proyecto en [neon.tech](https://neon.tech) (plan gratuito sirve para empezar).
2. Copiar la **connection string con pooling** (`...-pooler.neon.tech`) → será `DATABASE_URL`.
3. Aplicar el schema y el seed desde local (con el VPN apagado):
   ```bash
   DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npx prisma migrate deploy
   DATABASE_URL="..." SEED_ADMIN_PASSWORD="una-clave-fuerte" npm run db:seed
   ```
   ⚠️ Cambia las contraseñas del seed en producción (`SEED_ADMIN_PASSWORD`/`SEED_USER_PASSWORD`),
   o borra el usuario demo `cliente@moodsense.dev` después.

## 2. Meilisearch

Opciones: [Meilisearch Cloud](https://cloud.meilisearch.com) (recomendado, tiene free tier) o un
VPS propio. Con el host y la master key:

```bash
MEILISEARCH_HOST="https://..." MEILISEARCH_MASTER_KEY="..." DATABASE_URL="...neon..." npm run search:sync
```

Sin Meilisearch la página `/search` muestra «búsqueda no disponible» y el resto funciona.

## 3. Vercel

1. `vercel.com` → Add New Project → importar el repo `moodsense-web-store` (framework: Next.js, sin cambios).
2. **Variables de entorno** (Settings → Environment Variables), copiar de `.env.example`:

   | Variable                                                      | Valor                                            |
   | ------------------------------------------------------------- | ------------------------------------------------ |
   | `DATABASE_URL`                                                | connection string de Neon (pooler)               |
   | `AUTH_SECRET`                                                 | `npx auth secret` (uno NUEVO, no el de dev)      |
   | `AUTH_URL` / `NEXT_PUBLIC_APP_URL`                            | `https://tu-dominio.vercel.app`                  |
   | `MEILISEARCH_HOST` / `MEILISEARCH_MASTER_KEY`                 | de Meilisearch Cloud                             |
   | `NEXT_PUBLIC_CHECKOUT_MODE`                                   | `whatsapp`                                       |
   | `WHATSAPP_OPERATOR_PHONE`                                     | número del operador (`18095550100`)              |
   | `WHATSAPP_CLOUD_API_TOKEN` / `WHATSAPP_CLOUD_PHONE_NUMBER_ID` | vacíos hasta tener la Cloud API                  |
   | `ORDER_PAYMENT_EXPIRY_HOURS`                                  | `48`                                             |
   | `CRON_SECRET`                                                 | string aleatorio largo (`openssl rand -hex 32`)  |
   | `BLOB_READ_WRITE_TOKEN`                                       | lo genera Vercel al crear el Blob store (paso 4) |

3. Deploy. El cron de `vercel.json` (expira pedidos una vez al día — el plan Hobby no permite más; además el barrido corre al abrir la lista de pedidos del admin) se registra solo; Vercel envía
   automáticamente el header con `CRON_SECRET`.

## 4. Vercel Blob (imágenes del admin)

Storage → Create Database → **Blob** → conectarlo al proyecto. Vercel inyecta
`BLOB_READ_WRITE_TOKEN` y el botón "Subir archivo" del formulario de productos queda operativo.

## 5. Verificación post-deploy

- [ ] Home, PLP y una PDP cargan; búsqueda responde.
- [ ] Login admin y dashboard.
- [ ] Pedido de prueba completo: checkout → PENDING_PAYMENT → confirmar → cancelar (stock vuelve).
- [ ] `https://tu-dominio/sitemap.xml` y `/robots.txt` responden.
- [ ] Crear un producto con imagen subida (Blob).

## Reactivar Stripe (cuando haya cuenta)

1. Clave en Vercel: `STRIPE_SECRET_KEY`.
2. Webhook en el dashboard de Stripe → `https://tu-dominio/api/webhooks/stripe`
   (eventos `checkout.session.completed` y `checkout.session.expired`) → el signing secret va en
   `STRIPE_WEBHOOK_SECRET`.
3. `NEXT_PUBLIC_CHECKOUT_MODE="stripe"` y redeploy. Nada más — el flujo quedó verificado en Fase 4.
