# Piloto EsquiTrail — Montecristo 2026

> **Fuente de verdad del piloto.** Actualizar al cerrar cada fase.  
> Chats nuevos: abrir este archivo y continuar solo la fase activa.  
> Última actualización: 2026-09-11 (fase D branding en curso; DNS aplazado)

---

## Estado

| Campo | Valor |
|-------|--------|
| Fase activa | **D — Branding Montecristo** *(DNS aplazado)* · luego **E** ensayo |
| App base | RacePics MVP existente (no reescribir) |
| Supabase | **Healthy** + migración rate limit bib (2026-09-11) |
| Google Cloud Vision | ✅ Billing + Vision + JSON local (`racepics-dev`) |
| Vercel prod | ✅ `https://racepics-seven.vercel.app` — landing + smoke OK |
| Inngest cloud | ✅ App `racepics` sync Success → `/api/inngest` · concurrency OCR env `OCR_CONCURRENCY` (default 10) |
| Subdominio | `fotos.esquitrail.com` (**aplazado** — después del branding) |
| Branding EsquiTrail | 🔄 En curso — logo + colores en `/e/montecristo-2026` |

---

## Datos del evento

| Campo | Valor |
|-------|--------|
| Nombre | Trail Run Montecristo 2026 |
| Web | https://esquitrail.com/ |
| Fecha | 27 de septiembre 2026 |
| Lugar | Parque Chatún, Esquipulas, Guatemala |
| Inscritos | ~265 |
| Dorsales | **1–300** |
| Fotos estimadas | **~7.000** (límite app objetivo: **10.000**) |
| Fotógrafos captura | 8 |
| Quién sube a la app | 1 fotógrafo asignado |
| Ventana subida | Mismo día → máx. 3 días |
| Retención fotos | **Máx. 2 meses** → borrar todo |
| Precio corredor | Gratis |
| Modelo RacePics | Gratis a cambio de caso de éxito |
| Soporte corredores | EsquiTrail |
| Integración | Subdominio + logo EsquiTrail |
| Privacidad | Solo dorsal (sin nombre/email en búsqueda) |

---

## Principio técnico

**Reutilizar RacePics tal cual** (auth, eventos, upload, OCR, galería, watermark, share, export).  
Solo: deploy prod + ajustes P0/P1 del piloto. Sin face, pagos ni WhatsApp en este evento.

---

## Fases (orden fijo)

| Fase | Foco | Estado |
|------|------|--------|
| **A** | Contratación (GCP → Vercel → Inngest → DNS) | ✅ Casi lista (falta DNS fase D) |
| **B** | Deploy prod + smoke test (~20 fotos) | ✅ OK 2026-09-11 |
| **C** | Código P0: límite 10k + concurrency OCR + rate limit bib | ✅ OK 2026-09-11 |
| **D** | Subdominio + logo EsquiTrail | 🔄 Branding UI ✅ · DNS ⬜ aplazado |
| **E** | Ensayo: primero **~1.000** fotos; luego subir hacia 7k | ⬜ (tras organizadores) |
| **F** | Día D / post / borrado 60 días / caso de éxito | ⬜ |

**Regla de chat:** una fase por conversación cuando sea posible. Prompt: *“Piloto EsquiTrail, fase X — ver `docs/piloto-esquitrail.md`”*.

---

## Fase A — Qué contratar (checklist)

### 1. Google Cloud (OCR) — HACER AHORA

Links oficiales:

| Paso | Link |
|------|------|
| Consola GCP | https://console.cloud.google.com/ |
| Activar facturación (Billing) | https://console.cloud.google.com/billing |
| Habilitar Cloud Vision API | https://console.cloud.google.com/apis/library/vision.googleapis.com |
| Crear service account | https://console.cloud.google.com/iam-admin/serviceaccounts |
| Credenciales (JSON key) | En el service account → Keys → Add key → JSON |

Checklist GCP:

- [x] Proyecto: **RacePics Dev** (`racepics-dev`)
- [x] Billing vinculado: **My Billing Account** (`01AB5E-F302EE-A55409`) — confirmado 2026-09-11
- [x] Cloud Vision API **Enabled** (2026-09-11)
- [x] Service account con acceso al proyecto (Editor / Vision)
- [x] JSON key en `secrets/gcp-vision.json` (**gitignore OK**) — 2026-09-11
- [x] `project_id` = `racepics-dev` → `GOOGLE_CLOUD_PROJECT_ID`

Coste esperado OCR ~7.000 fotos: del orden de **USD 10–25** (más si se usa imagen de referencia por foto).

### 2. Supabase

- [x] Proyecto RacePics **healthy** (confirmado 2026-09-11)
- [ ] Verificar migraciones al día (`npx supabase db push` cuando toque fase B)
- [ ] Plan Storage suficiente para ~35–85 GB (7k fotos) o resize al subir (fase E)
- [ ] Auth Site URL se actualizará a dominio prod en fase B/D

### 3. Vercel — reutilizar proyecto existente

- [x] Proyecto **racepics** ya existe y está linkeado al repo (`.vercel` → `prj_BJpi9i03…`) — no crear uno nuevo
- [x] Environment Variables Production presentes (2026-09-11): Supabase ×3, GCP ×2, Inngest ×2, `NEXT_PUBLIC_APP_URL`
- [ ] Verificar que `GOOGLE_*` coinciden con el JSON nuevo (`racepics-dev` / `secrets/gcp-vision.json`)
- [ ] Confirmar URL Production actual + Redeploy tras cualquier cambio de env
- Guía: `docs/deployment.md`

### 4. Inngest cloud — keys ya en Vercel

- [x] App en https://app.inngest.com/ → **racepics**
- [x] Sync URL: `https://racepics-seven.vercel.app/api/inngest` — Last sync **Success** (23/6/2026)
- [ ] Tras redeploy reciente: Resync / verificar functions otra vez
- [x] Concurrency OCR configurable via `OCR_CONCURRENCY` (default **10**, máx. 50) — 2026-09-11
- [ ] Confirmar plan Inngest cloud permite concurrency ≥10 en prod

### 5. DNS EsquiTrail — cuando Vercel esté live

- [ ] CNAME `fotos` → CNAME de Vercel  
- [ ] URL final: `https://fotos.esquitrail.com`  
- Contacto DNS: organizador (comunicación constante con founder)

---

## Cambios de producto previstos (no hacer hasta su fase)

| Prioridad | Cambio | Fase |
|-----------|--------|------|
| P0 | `MAX_PHOTOS_PER_EVENT` 5.000 → **10.000** | C ✅ |
| P0 | Concurrency OCR configurable / >5 | C ✅ (`OCR_CONCURRENCY`, default 10) |
| P0 | Rate limit búsqueda por dorsal (anti-abuso) | C ✅ |
| P1 | Logo EsquiTrail en `/e/[slug]` + watermark | D 🔄 (logo + watermark listos; DNS después) |
| P1 | Thumbnails o resize (recomendado por volumen) | E o post-E |
| P2 | Retención / job borrado a 60 días | F |
| Fuera de alcance piloto | Face, Stripe, WhatsApp push, iframe | — |

### Decisiones 2026-09-11

- Ensayo inmediato: **~1.000 fotos** con stack actual (planes actuales OK para esa prueba).
- Prep código: límite **10k** + OCR más capaz para no quedarnos cortos en el evento (~7k).
- Branding EsquiTrail: **después** del funcionamiento.
- Rate limit bib: **sí**, implementar en fase C (hoy no existe en código).

### Rate limit búsqueda pública (implementado 2026-09-11)

Objetivo: evitar scraping de toda la galería; no castigar al corredor legítimo.

| Regla | Valor |
|-------|--------|
| Ventana | **1 hora** (`BIB_SEARCH_WINDOW_SECONDS`, default 3600) |
| Búsquedas distintas (bibs) por cliente | **5** (`BIB_SEARCH_MAX_DISTINCT`) |
| Misma bib (reintentos/refresh) | **30/h** (`BIB_SEARCH_MAX_SAME`) — no penalizar F5 |
| Tras exceder | Mensaje claro + “prueba en X minutos” |
| Alcance | Solo `/e/[slug]` búsqueda pública |
| Implementación | Cookie `rp_rl` + hash IP · tabla `bib_search_attempts` · RPC `check_bib_search_rate_limit` |

Fail-open si la RPC falla (no bloquea corredores si la migración no está aplicada).

---

## Fase B — Smoke test (checklist)

URL: https://racepics-seven.vercel.app

- [x] Landing carga
- [x] Login / registro organizador
- [x] Crear evento + asignar fotógrafo
- [x] Subir **20** fotos → todas reconocidas (OCR)
- [x] Búsquedas por dorsal OK
- [x] Descarga + WhatsApp + redes OK

Smoke prod **aprobado** 2026-09-11.

---

## Cuentas y URLs (rellenar al contratar)

| Servicio | Dato | Valor |
|----------|------|--------|
| Supabase | Estado | Healthy |
| GCP | Project ID | `racepics-dev` |
| GCP | Billing | My Billing Account (`01AB5E-F302EE-A55409`) |
| GCP | Vision API | Enabled + JSON key listo (2026-09-11) |
| Vercel | Env vars Production | Completas (Supabase, GCP, Inngest, APP_URL) — revisar GCP vs JSON nuevo |
| Vercel | URL deploy | `https://racepics-seven.vercel.app` |
| Inngest | App | `racepics` · sync OK a `/api/inngest` (23/6/2026) |
| Público | Subdominio | fotos.esquitrail.com (pendiente) |
| Evento | Slug propuesto | `montecristo-2026` (**brand activo** en código) |

---

## Métricas objetivo (fase E / F)

| Métrica | Objetivo |
|---------|----------|
| Fotos procesadas | ~7.000 (ensayo previo ≥500–1000) |
| OCR con dorsal visible | ≥85% |
| Búsqueda corredor | &lt;3 s |
| Retención | Borrado ≤ 60 días post-evento |

---

## Log de sesiones

| Fecha | Fase | Hecho |
|-------|------|--------|
| 2026-09-11 | A | Doc creado. Supabase healthy. |
| 2026-09-11 | A | Inngest OK: `racepics` → `https://racepics-seven.vercel.app/api/inngest` (Success). |
| 2026-09-11 | B | Landing prod carga. Siguiente: smoke auth → evento → upload → OCR → bib. |
| 2026-09-11 | B | ✅ Smoke OK: 20 fotos, OCR 100%, búsqueda/descarga/WA/redes. |
| 2026-09-11 | C | Decisiones: ensayo 1k con planes actuales; prep 10k; rate limit bib; cosmética EsquiTrail aplazada. |
| 2026-09-11 | C | ✅ Código: `MAX_PHOTOS` 10k · `OCR_CONCURRENCY` default 10 · rate limit bib (migración + UI). Siguiente: fase E ensayo ~1k. |
| 2026-09-11 | D | Branding `/e/montecristo-2026`: logo, paleta beige/marrón (`colores_montecristo`), Oswald, watermark `Montecristo 2026 - Esquitrail`. DNS aplazado. |
| 2026-09-11 | E | ✅ Ensayo con organizadores OK: 100 fotos, OCR 86% con dorsal. |
| 2026-09-27 | F | Día D: borradas las 100 fotos de ensayo del evento oficial. Galería sirve fotos directo de Supabase (`unoptimized`) para no agotar cupo de imágenes Vercel. **Bloqueante:** Supabase en plan Free (1 GB) → subir a Pro antes de cargar ~7k fotos. |

---

## Referencias

- Deploy: `docs/deployment.md`
- Stack Vision: `docs/stack-tecnologico.md` (sección Google Cloud Vision)
- Env vars: `docs/decisiones-arquitectura.md`
- MVP scope: `docs/mvp.md`
