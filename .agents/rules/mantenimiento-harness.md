---
trigger: model_decision
description: "Cómo está organizado el harness de agentes (Claude Code + Antigravity, fuente única) y cómo hacer cambios futuros en reglas, subagentes o herramientas integradas. Leer antes de cambiar el harness."
---

# Mantenimiento del harness de agentes

El harness funciona igual en **Claude Code** y en **Google Antigravity** con **una única fuente de verdad**. Cada instrucción vive en un solo lugar: sin duplicar texto y sin enlaces simbólicos.

## Estructura

| Ubicación                             | Qué contiene                                                                                                      | Quién la lee                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `AGENTS.md`                           | Reglas maestras globales + tabla de reglas de `.agents/rules/`                                                    | Todas las herramientas                                                          |
| `.agents/rules/<tema>.md`             | Una regla global por archivo, primer nivel (sin subcarpetas), con encabezado YAML `trigger`/`description`/`globs` | Antigravity directamente; Claude Code vía `CLAUDE.md` o la tabla de `AGENTS.md` |
| `CLAUDE.md`                           | Solo importaciones `@AGENTS.md` y `@.agents/rules/<tema>.md` de las reglas `always_on` y `glob`                   | Claude Code                                                                     |
| `.claude/rules/<tema>.md`             | Reglas propias de Claude Code (se cargan solas, sin importarlas)                                                  | Claude Code                                                                     |
| `.agents/rules/antigravity-<tema>.md` | Reglas propias de Antigravity, con su `trigger`; no se importan en `CLAUDE.md` ni se listan en la tabla común     | Antigravity                                                                     |
| `.agents/prompts/<nombre>-base.md`    | Instrucciones de un subagente (una sola vez)                                                                      | Ambas, vía las definiciones                                                     |
| `.claude/agents/<nombre>.md`          | Definición del subagente para Claude Code                                                                         | Claude Code                                                                     |
| `.agents/agents/<nombre>.md`          | Definición del subagente para Antigravity                                                                         | Antigravity                                                                     |

## Criterio para cambios

- **Cambio global** (criterios del proyecto, forma de trabajo, commits, convenciones): se escribe **una vez** en la fuente común — `AGENTS.md` o un archivo de `.agents/rules/` —. Si es una regla nueva: encabezado YAML válido, fila en la tabla de `AGENTS.md`, e importación en `CLAUDE.md` **solo** si es `always_on` o `glob`.
- **Cambio propio de una herramienta** (sintaxis, modelos, nombres de herramientas, formato de subagentes): se construye **por separado para cada herramienta integrada**, en su lugar propio (ver tabla de estructura).
- **Integrar otra herramienta**: recibe su carpeta, su archivo de entrada con importaciones a la fuente común y, si el harness no se versiona, su exclusión en `.git/info/exclude`.

## Encabezado YAML de las reglas

```yaml
---
trigger: always_on # always_on | model_decision | glob | manual (minúsculas, guion bajo)
description: "Qué contiene y cuándo aplicarla"
globs: "src/**/*.ts, tests/**/*.ts" # solo con trigger: glob; entre comillas, separados por coma
---
```

- Sin un `trigger` válido, Antigravity descarta la regla sin avisar. Límite de Antigravity: 24 KB por archivo.
- `always_on`: lo que se usa en casi todos los turnos (incluido el estado vivo del trabajo y lo que debe verificarse antes de una acción irreversible, como un commit).
- `glob`: convenciones de ciertos archivos. En Claude Code se importan en `CLAUDE.md`, así que allí quedan siempre cargadas.
- `model_decision`: historial, referencias y procedimientos ocasionales. **No** se importan en `CLAUDE.md`: Claude Code las encuentra por la tabla de `AGENTS.md`.

## Subagentes

- Instrucciones una sola vez en `.agents/prompts/<nombre>-base.md`.
- Claude Code (`.claude/agents/<nombre>.md`): `name`, `description`, `tools` como texto (`Read, Grep, Glob, Edit, Write, Bash`) y `model` si hace falta.
- Antigravity (`.agents/agents/<nombre>.md`): `name`, `description` y `tools` como **lista YAML**, solo con nombres de herramientas confirmados en la documentación vigente o en el panel `/agents` (un nombre desconocido puede colgar al subagente). Sin `model`, para que herede.
- Cuerpo de ambas definiciones: «Antes de cualquier otra acción, leé `.agents/prompts/<nombre>-base.md` y seguilo estrictamente», más la referencia `@.agents/prompts/<nombre>-base.md` (ninguna herramienta garantiza insertar un `@archivo` dentro de un subagente).

## Versionado

El harness **se versiona** en git (`AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/rules/`, `.claude/agents/`); `.claude/settings.local.json` sigue en `.gitignore`. Si algún día deja de versionarse, excluir `.agents/`, `.claude/`, `AGENTS.md` y `CLAUDE.md` en `.git/info/exclude` (nunca en `.gitignore`).

## Historial del harness

- **2026-11-19 — Migración a fuente única Claude Code + Antigravity.** El antiguo `CLAUDE.md` monolítico se dividió en `AGENTS.md` + `.agents/rules/` (contenido de las reglas sin cambios: solo ubicación, rutas internas y encabezados); `.claude/rules.md` pasó a `.agents/rules/convenciones.md`; `CLAUDE.md` quedó solo con importaciones. Respaldo del harness previo fuera del repo: `~/harness-backup-moodsense-2026-11-19/` (WSL).
