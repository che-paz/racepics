# RacePics — Documentación del Proyecto

> Plataforma SaaS para gestión y distribución de fotos en carreras deportivas.  
> **Stack:** Next.js 14 · Supabase · Google Vision · Inngest · Vercel · Tailwind · shadcn/ui

---

## Qué es RacePics

Los fotógrafos suben miles de fotos. Los corredores buscan **su número de bib** y ven **solo sus fotos** en segundos.

**Actores:** Organizador (paga, crea evento) · Fotógrafo (sube fotos) · Corredor (busca bib, descarga)

**Modelo:** Organizador paga por evento — Starter $25 / Pro $50 / Elite $100 (post-MVP).

---

## Inicio rápido (chat nuevo)

1. Lee este archivo
2. Lee `decisiones-arquitectura.md` si tocas DB/auth/integraciones
3. Lee la sección del sprint actual en `roadmap.md`
4. Usa el prompt de `protocolo-sesiones.md`

---

## Índice de documentos

| Archivo | Propósito | Actualiza | Cuándo | Responde |
|---------|-----------|---------|--------|----------|
| **README.md** | Índice maestro + contexto mínimo | Tech Lead | Cambio de scope o nuevo doc | ¿Qué es RacePics? ¿Por dónde empiezo? |
| **mvp.md** | Scope MVP: 3 features, roles, happy path | Product/Tech Lead | Cambio de prioridades | ¿Qué entra y qué no en v1? |
| **estructura-proyecto.md** | Árbol de carpetas y responsabilidades | Dev que crea carpetas | Nueva carpeta/módulo | ¿Dónde va este archivo? |
| **decisiones-arquitectura.md** | Decisiones técnicas, env vars, convenciones | Quien toma la decisión | Cada decisión irreversible | ¿Por qué Inngest? ¿Cómo nombrar tablas? |
| **stack-tecnologico.md** | Setup y config de cada tecnología | Dev de infra | Cambio de versión/config | ¿Cómo instalar Supabase local? |
| **roadmap.md** | Sprints semanales hasta prod | Tech Lead | Fin de sprint | ¿Qué toca esta semana? |
| **estrategia-tokens.md** | Optimizar sesiones Cursor | Tech Lead | Cambio de workflow | ¿Cuánto cabe en un chat? |
| **protocolo-sesiones.md** | Prompt inicio + cierre de sesión | Tech Lead | Cambio de protocolo | ¿Qué prompt uso? ¿Cómo cierro? |
| **go-to-market.md** | Carta de venta, pricing, objeciones, guion demo | Founder/ventas | Post Sprint 8 o cambio de pricing | ¿Cómo vendo? ¿Qué prometo en piloto? |

---

## Documentos futuros (crear cuando aplique)

| Archivo | Cuándo crear |
|---------|--------------|
| `api-reference.md` | Al estabilizar endpoints |
| `deployment.md` | ✅ Creado Sprint 6 — deploy Vercel + env vars |
| `go-to-market.md` | ✅ Creado — estrategia comercial y guion ventas |
| `runbook-ocr.md` | Tras primer evento real con fallos OCR |
| `CHANGELOG.md` | Primera release |

---

## Estado actual

| Campo | Valor |
|-------|-------|
| Fase | Desarrollo — Sprint 6 deploy prod pendiente |
| Sprint | 6 — Deploy Vercel + smoke test (siguiente sesión) |
| Repo | Next.js 14 · Supabase cloud · upload · OCR · galería · share · export 5k |
| Dev local | `http://localhost:3002` + `npm run inngest:dev` (2 terminales) |
| DB | Migraciones hasta `20250722` (aplicar `db push` antes del piloto) |
| Modelo comercial | Evento piloto gratis → caso de éxito → Stripe (Sprint 9+) |
| Próximo paso | Deploy Vercel prod — ver `docs/deployment.md` |

---

## Links rápidos internos

- MVP scope → [mvp.md](./mvp.md)
- Carpetas → [estructura-proyecto.md](./estructura-proyecto.md)
- Convenciones → [decisiones-arquitectura.md](./decisiones-arquitectura.md)
- Sprints → [roadmap.md](./roadmap.md)
- Ventas / GTM → [go-to-market.md](./go-to-market.md)
- Iniciar chat → [protocolo-sesiones.md](./protocolo-sesiones.md)
