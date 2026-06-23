# Protocolo de Sesiones — RacePics

> Última actualización: 2025-06-19

---

## Prompt de inicio estándar (<150 tokens)

Copiar y pegar al abrir chat nuevo:

```
RacePics — sesión de desarrollo.

Lee docs/README.md y la sección del sprint actual en docs/roadmap.md.
Si toco DB/auth/integraciones, lee también docs/decisiones-arquitectura.md.

Tarea: [DESCRIBIR UNA SOLA TAREA]

Archivos: [LISTAR 1-3 ARCHIVOS RELEVANTES]

Al terminar: actualiza docs afectados y usa template "Sesión completada".
```

**Ejemplo relleno (~90 tokens):**

```
RacePics — sesión de desarrollo.

Lee docs/README.md y sprint 2 en docs/roadmap.md.
Lee docs/decisiones-arquitectura.md.

Tarea: Implementar página pública /e/[slug] con búsqueda por bib.

Archivos: src/app/(public)/e/[slug]/page.tsx, src/components/events/BibSearch.tsx

Al terminar: actualiza docs y usa template "Sesión completada".
```

---

## Checklist pre-código

- [ ] Leí `docs/README.md`
- [ ] Sé qué sprint estoy ejecutando (`roadmap.md`)
- [ ] Conozco convenciones relevantes (`decisiones-arquitectura.md`)
- [ ] Mi tarea es **una sola** cosa concreta
- [ ] Sé qué archivos voy a tocar (≤5)
- [ ] Sé qué doc actualizar al cerrar

---

## Reporte al final de sesión

Antes de cerrar el chat, el agente debe:

1. **Resumir** qué se hizo (3-5 bullets)
2. **Listar** archivos creados/modificados
3. **Actualizar** doc(s) afectados en `docs/`
4. **Indicar** próximo paso concreto (1 línea)
5. **Marcar** tareas completadas en `roadmap.md` si aplica

---

## Template: Sesión completada

Copiar al final del chat y persistir en el doc indicado:

```markdown
## Sesión completada — YYYY-MM-DD

**Sprint:** N  
**Tarea:** [descripción corta]

### Hecho
- [ ] item 1
- [ ] item 2

### Archivos tocados
- `path/to/file.tsx` — [qué cambió]

### Docs actualizados
- [ ] roadmap.md — tarea X marcada ✓
- [ ] decisiones-arquitectura.md — [si hubo decisión nueva]

### Próximo paso
[Una acción concreta para la siguiente sesión]

### Blockers / decisiones pendientes
- [ninguno | descripción + quién decide]
```

**Dónde pegar:** Añadir entrada al final de `roadmap.md` bajo el sprint, o crear nota en `decisiones-arquitectura.md` si hay decisión nueva.

---

## Reglas de cierre

| Situación | Acción obligatoria |
|-----------|---------------------|
| Feature terminada | Marcar ✓ en roadmap + actualizar README estado |
| Decisión técnica | Añadir fila en decisiones-arquitectura.md |
| Nueva carpeta | Actualizar estructura-proyecto.md |
| Bug sin resolver | Documentar en roadmap como blocker |
| Scope cambió | Actualizar mvp.md |

**Nunca cerrar sesión sin actualizar al menos 1 doc.**

---

## Tipos de sesión

| Tipo | Docs a leer | Duración típica |
|------|-------------|-----------------|
| Setup infra | README + stack-tecnologico + roadmap | 1 sesión |
| Feature UI | README + mvp + estructura | 1-2 sesiones |
| Backend/DB | README + decisiones-arquitectura | 1 sesión |
| Integración (OCR/Inngest) | README + decisiones + stack | 2 sesiones |
| Bugfix | Solo archivos del bug + decisiones si auth/DB | 1 sesión |
