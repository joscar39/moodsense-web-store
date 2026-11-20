---
trigger: model_decision
description: "Entorno local (WSL, Node vía nvm, Docker) y troubleshooting conocido: Postgres/Redis de apt tapando puertos, VPN rompiendo la red, npm install-scripts, healthcheck de Meilisearch. Leer antes de ejecutar comandos de entorno o ante errores de red, puertos o build."
---

# Entorno local y troubleshooting

**Ubicación del proyecto — WSL nativo (2026-07-10).** El proyecto se movió de Windows (`C:\Users\Admin\Documents\Desarrollo`) al filesystem nativo de WSL (`~/projects/moodsense-web-store`). La migración se hizo mediante **clone limpio por SSH**, no por copia directa entre filesystems, para evitar problemas de permisos y de performance de I/O entre NTFS y ext4. El path de Windows queda obsoleto: no trabajar desde ahí.

**Node.js — usar exclusivamente el de nvm (Linux).** El entorno requiere Node.js nativo de Linux instalado vía **nvm (v22)**. NO usar el Node de Windows ni el de apt/Ubuntu: mezclar cualquiera de esos provoca errores de rutas UNC o conflictos de PATH. Verificación rápida:

```bash
which node   # debe apuntar a ~/.nvm/versions/node/...
```

Si no apunta ahí, correr `nvm use 22` o revisar que `~/.bash_profile` cargue `~/.bashrc` (donde nvm se inicializa).

**PostgreSQL de apt deshabilitado (2026-07-10).** Ubuntu (WSL) tenía `postgresql-16` de apt corriendo en el puerto 5432, **tapando el puerto publicado del contenedor Docker**: las conexiones desde WSL fallaban con `P1000 Authentication failed` aunque el contenedor estaba sano. Se deshabilitó con `sudo systemctl disable --now postgresql postgresql@16-main` (el paquete sigue instalado). Si tras reiniciar WSL reaparece un P1000/ECONNREFUSED en 5432: verificar `ss -tln | grep 5432` (no debe haber listener de apt) y hacer `docker compose restart postgres` para que Docker Desktop restablezca el forward del puerto hacia la distro.

**Surfshark VPN rompe la red de WSL (2026-07-10).** Con Surfshark (WireGuard) conectado en Windows: el DNS de Surfshark devuelve IPs envenenadas/redirigidas (ej. `google.com` → `145.223.9.19`) y el tráfico saliente de WSL se cae por timeout (npm, curl, descargas). Cambiar `resolv.conf` en WSL NO ayuda: el túnel DNS de WSL intercepta el puerto 53. **Síntoma clásico:** `next build` colgado para siempre en "Creating an optimized production build" (era `next/font/google` intentando descargar fuentes — ya eliminado con fuentes self-hosted, decisión 14), o `npm install` que no avanza. **Solución:** desconectar el VPN (o configurar split-tunneling/bypass para WSL) cuando se necesite red desde WSL.

**Redis de apt también instalado en Ubuntu.** Igual que pasó con Postgres: hay un `redis-server` de apt corriendo en `127.0.0.1:6379` dentro de WSL que tapa el puerto del contenedor Docker. Aún no bloquea nada (Redis no se usa en el código todavía); **deshabilitarlo antes de integrar ioredis**: `sudo systemctl disable --now redis-server`.

**npm 12 bloquea install scripts nuevos.** Al instalar paquetes con scripts de instalación (prisma, esbuild, sharp…), npm los bloquea hasta aprobarlos: `npm install-scripts approve <pkg>` + `npm rebuild <pkg>`. Los aprobados quedan registrados en `package.json` (clave `allowScripts`).

**Healthcheck de Meilisearch — resuelto (2026-07-11).** El servicio aparecía "unhealthy" siendo un falso negativo: `wget` no resolvía `localhost` dentro del contenedor. El healthcheck ahora apunta a `http://127.0.0.1:7700/health` y los 3 servicios reportan healthy en `docker compose ps`.
