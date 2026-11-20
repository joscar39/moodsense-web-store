# Mood Sense — Web Store · Memoria del proyecto

> Este archivo y las reglas de `.agents/rules/` son la memoria viva del proyecto. **Regla permanente:** al completar una fase, tomar una decisión de arquitectura, cambiar una dependencia o hacer cualquier ajuste relevante, actualizar la fuente correspondiente (este archivo o la regla afectada de `.agents/rules/`; `.agents/rules/convenciones.md` si introduce una convención nueva) **en el mismo commit** del cambio — nunca en un commit separado posterior.

Antes de cambiar el harness, leer `.agents/rules/mantenimiento-harness.md`.

## Resumen del proyecto

**Mood Sense** es un e-commerce tipo _concept store multimarca_: curaduría transversal de ropa, calzado, gorras y accesorios de estilo urbano, streetwear premium y casual moderno, para hombre y mujer (público 18–35, mobile-first). Slogan oficial: **"Wear your vibe. Make the match."** · Tagline secundario: _"Curated multi-brand concept store · Head-to-toe style"_. Propuesta head-to-toe: armar un outfit completo y auténtico en un solo lugar. Referencia estructural de UX: bdgastore.com (solo estructura, no identidad).

## Reglas del proyecto (`.agents/rules/`)

| Regla                                      | Contenido                                                                                  | Cuándo leerla                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `.agents/rules/convenciones.md`            | Estilo, estructura feature-based, patrones obligatorios, seguridad, testing, git y proceso | Siempre (activa en todo turno)                                                   |
| `.agents/rules/estado-actual.md`           | Fase en curso, lo completado y pendiente, flujo de trabajo entre fases                     | Siempre (activa en todo turno)                                                   |
| `.agents/rules/stack.md`                   | Stack con versiones y avisos de majors, pendientes de instalar, deuda conocida             | Al editar código o dependencias                                                  |
| `.agents/rules/design-system.md`           | Paleta de marca, modos editorial/boutique, tipografía                                      | Al editar UI o estilos                                                           |
| `.agents/rules/decisiones-arquitectura.md` | Decisiones de arquitectura numeradas                                                       | Antes de diseñar o cambiar checkout, stock, pedidos, auth, búsqueda o estructura |
| `.agents/rules/historial-fases.md`         | Detalle de las Fases 0–6 completadas                                                       | Al retomar o modificar funcionalidad de esas fases                               |
| `.agents/rules/comandos.md`                | Comandos npm/docker y usuarios del seed                                                    | Al ejecutar comandos del proyecto                                                |
| `.agents/rules/entorno-local.md`           | WSL, Node vía nvm, Docker y troubleshooting conocido                                       | Antes de comandos de entorno o ante errores de red, puertos o build              |
| `.agents/rules/mantenimiento-harness.md`   | Organización del harness y criterio para cambiarlo                                         | Antes de cambiar el harness                                                      |
