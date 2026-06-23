# Estrategia de Optimización de Tokens

> Última actualización: 2025-06-19

## Objetivo

Minimizar tokens por sesión sin perder contexto entre chats. La memoria vive en `docs/`, no en el historial del chat.

---

## Tamaño máximo por sesión

| Métrica | Límite recomendado |
|---------|-------------------|
| Duración del chat | 1 tarea concreta (~30-60 min) |
| Archivos editados | ≤5 por sesión |
| Líneas de diff | ≤300 |
| Prompt del usuario | ≤200 tokens (1 objetivo + archivos relevantes) |

**Regla:** Si el chat supera ~15 intercambios o toca >3 áreas del proyecto → cerrar y abrir chat nuevo.

---

## Lectura obligatoria al inicio (orden)

1. `docs/README.md` — contexto general (2 min)
2. `docs/decisiones-arquitectura.md` — solo si toca DB, auth, integraciones
3. `docs/roadmap.md` — solo la sección del sprint actual
4. Archivo específico de la tarea (ej. `mvp.md` si es feature de corredor)

**No leer:** roadmap completo, estructura completa, stack completo — solo las secciones relevantes.

---

## Estructura del prompt diario

```markdown
## Contexto
Proyecto RacePics. Lee docs/README.md y [doc específico].

## Tarea
[Una sola acción concreta]

## Archivos relevantes
- src/app/(public)/e/[slug]/page.tsx
- src/lib/vision/ocr.ts

## Restricciones
- Seguir convenciones en docs/decisiones-arquitectura.md
- Actualizar docs al terminar
```

---

## Chat nuevo vs continuar

| Situación | Acción |
|-----------|--------|
| Misma tarea, mismo archivo, <10 mensajes | Continuar |
| Cambio de feature/área (ej. upload → OCR) | Chat nuevo |
| Bug en código de sesión anterior | Continuar (tiene contexto) |
| Sesión de ayer o anterior | Chat nuevo + leer docs |
| Refactor grande (>5 archivos) | Chat nuevo, prompt con lista de archivos |

---

## Handoff entre sesiones

Al cerrar cada sesión, actualizar **uno** de estos (según lo tocado):

| Cambio | Archivo a actualizar |
|--------|---------------------|
| Feature completada | `roadmap.md` — marcar tarea ✓ |
| Decisión técnica | `decisiones-arquitectura.md` |
| Nueva carpeta/archivo | `estructura-proyecto.md` |
| Cambio de scope MVP | `mvp.md` |

Usar template en `docs/protocolo-sesiones.md` → sección "Sesión completada".

---

## Anti-patrones (evitar)

- Pegar logs completos → resumir error + 5 líneas relevantes
- "@codebase" en cada mensaje → referenciar archivos concretos
- Pedir "explícame todo el proyecto" → leer docs/README.md manualmente
- Múltiples tareas en un prompt → 1 tarea = 1 sesión
- Dejar decisiones solo en el chat → siempre persistir en docs/

---

## Estimación de tokens por lectura

| Archivo | Tokens aprox. |
|---------|---------------|
| README.md | ~400 |
| decisiones-arquitectura.md | ~600 |
| mvp.md | ~500 |
| roadmap.md (1 sprint) | ~300 |
| estructura-proyecto.md | ~500 |

**Budget inicio sesión típica:** ~800-1,200 tokens de docs + archivos de código objetivo.
