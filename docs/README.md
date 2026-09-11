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
2. Si es el piloto EsquiTrail: lee **solo** `piloto-esquitrail.md` (fase activa)
3. Lee `decisiones-arquitectura.md` si tocas DB/auth/integraciones
4. Lee la sección del sprint actual en `roadmap.md`
5. Usa el prompt de `protocolo-sesiones.md`

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
| **piloto-esquitrail.md** | Fuente de verdad piloto Montecristo 2026 | Founder + Tech | Cada cierre de fase del piloto | ¿Qué fase toca? ¿Qué contratar? |

---

## Documentos futuros (crear cuando aplique)

| Archivo | Cuándo crear |
|---------|--------------|
| `api-reference.md` | Al estabilizar endpoints |
| `deployment.md` | ✅ Creado Sprint 6 — deploy Vercel + env vars |
| `go-to-market.md` | ✅ Creado — estrategia comercial y guion ventas |
| `piloto-esquitrail.md` | ✅ Creado 2026-09-11 — piloto EsquiTrail |
| `runbook-ocr.md` | Tras primer evento real con fallos OCR |
| `CHANGELOG.md` | Primera release |

---

## Estado actual

| Campo | Valor |
|-------|-------|
| Fase | Piloto EsquiTrail — **fase D** (branding Montecristo; DNS aplazado) |
| Sprint | Post Sprint 6 — escala ✅ · branding Montecristo en curso |
| Repo | Next.js 14 · Supabase cloud healthy · upload · OCR · galería · share · export |
| Dev local | `http://localhost:3002` + `npm run inngest:dev` (2 terminales) |
| Prod | `https://racepics-seven.vercel.app` |
| DB | Supabase RacePics healthy (+ `bib_search_attempts`) |
| Modelo comercial | Piloto gratis → caso de éxito → Stripe (después) |
| Próximo paso | Redeploy branding · crear evento slug `montecristo-2026` · fase E con organizadores |

---

## Links rápidos internos

- MVP scope → [mvp.md](./mvp.md)
- Carpetas → [estructura-proyecto.md](./estructura-proyecto.md)
- Convenciones → [decisiones-arquitectura.md](./decisiones-arquitectura.md)
- Sprints → [roadmap.md](./roadmap.md)
- Ventas / GTM → [go-to-market.md](./go-to-market.md)
- Iniciar chat → [protocolo-sesiones.md](./protocolo-sesiones.md)
