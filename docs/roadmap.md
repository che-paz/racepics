# Roadmap MVP — RacePics

> Última actualización: 2025-06-23 (Sprint 6 — polish + deploy prep)  
> Inicio propuesto: **Semana del 23 Jun 2025** → Primer evento real: **Semana del 18 Ago 2025**

---

## Vista general

| Sprint | Fechas | Objetivo | Estado |
|--------|--------|----------|--------|
| 0 | 19 Jun | Documentación proyecto | ✅ |
| 1 | 23-27 Jun | Scaffold + Supabase | ✅ |
| 2 | 30 Jun - 4 Jul | Auth + roles + eventos CRUD | ✅ |
| 3 | 7-11 Jul | Upload fotos + Storage | ✅ |
| 4 | 14-18 Jul | Pipeline OCR (Inngest + Vision) | ✅ |
| 5 | 21-25 Jul | Búsqueda bib + galería corredor | ✅ |
| 6 | 28 Jul - 1 Ago | Polish, watermark, deploy prod | ✅ |
| 7 | 4-8 Ago | Beta interna + fixes | ⬜ |
| 8 | 11-15 Ago | Primer evento real (gratis) | ⬜ |
| 9+ | Post Ago | Caso de éxito + Stripe | ⬜ |

---

## Sprint 0 — Documentación ✅

**Objetivo:** Memoria del proyecto lista para desarrollo paralelo.

**Hecho:**
- [x] 8 docs en `docs/`
- [x] Decisiones D1-D9 documentadas
- [x] Protocolo de sesiones definido

**DoD:** Nuevo dev lee README y puede empezar Sprint 1.

---

## Sprint 1 — Scaffold + Supabase ✅

**Objetivo:** Repo funcional con Next.js 14, Tailwind, shadcn, Supabase local.

**Tareas:**
1. [x] `create-next-app` con App Router + TypeScript + Tailwind
2. [x] Instalar shadcn/ui (Button, Input, Card, Dialog)
3. [x] Configurar Supabase CLI + `supabase init`
4. [x] Migración inicial: `profiles`, `events` (schema mínimo)
5. [x] Clients Supabase: `client.ts`, `server.ts`, `admin.ts`

**Archivos creados:**
- `src/lib/supabase/*`
- `supabase/migrations/20250623_init.sql`
- `.env.local.example`
- `components.json`
- `src/app/(auth)/login/page.tsx`

**DoD:** `npm run dev` levanta; Supabase local conecta; login page renderiza.

**Pruebas:** Dev server OK · migración aplica sin error · Supabase dashboard muestra tablas.

> **Nota local:** Requiere Docker para `npm run db:start` / `npm run db:reset`. Copiar keys de `supabase start` a `.env.local`.

---

## Sprint 2 — Auth + Roles + Eventos CRUD ✅

**Objetivo:** Organizador crea eventos; sistema distingue roles.

**Tareas:**
1. [x] Auth Supabase (email/password) + middleware protección rutas
2. [x] Tabla `profiles` con `role`: organizer | photographer
3. [x] CRUD eventos en `/organizer/events` (create, list, edit)
4. [x] Config evento: rango bib (`bib_min`/`bib_max`) + upload imagen referencia dorsal
5. [x] Generación slug único + invitar fotógrafo

**Archivos creados:**
- `src/middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/(auth)/login/LoginForm.tsx`, `register/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/organizer/events/*`
- `src/components/events/EventForm.tsx`, `InvitePhotographerForm.tsx`
- `src/lib/events/slug.ts`
- `supabase/migrations/20250630_sprint2_auth_rls.sql`
- `supabase/migrations/20250701_grants.sql`
- `supabase/migrations/20250702_profiles_insert_own.sql`
- `supabase/migrations/20250703_ensure_rls_policies.sql`
- `src/lib/auth/profile.ts`, `src/app/error.tsx`, `src/app/global-error.tsx`

**DoD:** Organizador logueado crea evento con slug; ve listado. ✅ Verificado en cloud.

**Pruebas:** Registro → login → crear evento → aparece en DB · rutas protegidas redirigen.

> **Setup dev:** Supabase cloud · puerto **3002** · `migration repair` si tablas ya existían.

---

## Sprint 3 — Upload Fotos + Storage ✅

**Objetivo:** Fotógrafo sube batch de fotos a un evento.

**Tareas:**
1. [x] Bucket `photos` en Supabase Storage + policies
2. [x] API signed URL: `POST /api/upload`
3. [x] UI drag & drop: `/photographer/events/[id]/upload`
4. [x] Insert `photos` con status `pending` tras upload
5. [x] Progress bar + lista de fotos subidas

**Archivos creados:**
- `supabase/migrations/20250707_sprint3_photos_storage.sql`
- `supabase/migrations/20250708_fix_profiles_rls_recursion.sql`
- `supabase/migrations/20250709_fix_events_rls_recursion.sql`
- `src/app/api/upload/route.ts`
- `src/app/(dashboard)/photographer/events/[id]/upload/page.tsx`
- `src/components/photos/UploadZone.tsx`
- `src/hooks/usePhotoUpload.ts`
- `src/lib/photos/storage-path.ts`

**DoD:** 50 fotos suben a Storage; registros en DB con status pending. ✅ Verificado (11 fotos E2E en cloud).

**Pruebas:** Upload JPG · aparecen en bucket `photos` · DB rows `pending`. Sin galería UI aún (Sprint 4/5).

---

## Sprint 4 — Pipeline OCR ✅

**Objetivo:** Fotos procesadas automáticamente; bibs indexados.

**Tareas:**
1. [x] Setup Inngest dev + `/api/inngest` endpoint
2. [x] Wrapper Google Vision OCR en `src/lib/vision/`
3. [x] Function `process-photo`: OCR → filtrar por rango evento → validar con bib referencia → insert `photo_bibs`
4. [x] Trigger Inngest al completar upload (evento `photo/uploaded`)
5. [x] UI organizador: contador fotos processed/pending/failed + % accuracy OCR

**Archivos creados:**
- `inngest/functions/process-photo.ts`
- `src/lib/vision/ocr.ts`
- `src/lib/inngest/client.ts`
- `src/app/api/inngest/route.ts`
- `src/app/api/photos/[id]/process/route.ts`
- `src/app/api/events/[id]/process-pending/route.ts`
- `src/lib/photos/processing-stats.ts`
- `src/components/photos/PhotoStatusSummary.tsx`
- `src/components/photos/ProcessPendingButton.tsx`
- `supabase/migrations/20250714_sprint4_photo_bibs.sql`

**DoD:** Foto subida → en <2 min status `ready` + bib en `photo_bibs`. ✅ Verificado E2E (11 fotos `ready`, 10/11 con bib, ~91% OCR).

**Pruebas:** 11 fotos batch · Inngest `process-photo` Completed · `photo_bibs` poblado · contadores organizador OK (tras refresh).

---

## Sprint 5 — Búsqueda Bib + Galería Corredor ✅

**Objetivo:** Core del producto — corredor busca bib y ve sus fotos.

**Tareas:**
1. [x] Página pública `/e/[slug]` (sin auth)
2. [x] Componente `BibSearch` + query a `photo_bibs`
3. [x] Galería `PhotoGrid` con thumbs (signed URLs)
4. [x] Vista foto individual + descarga
5. [x] Watermark básico en descarga (sharp en API route)

**Archivos creados:**
- `src/app/(public)/e/[slug]/page.tsx`
- `src/components/events/BibSearch.tsx`
- `src/components/photos/PhotoGrid.tsx`
- `src/app/api/photos/[id]/download/route.ts`
- `src/lib/photos/bib-search.ts`
- `src/lib/photos/watermark.ts`
- `supabase/migrations/20250721_sprint5_public_gallery.sql`

**DoD:** Corredor entra a URL → escribe bib → ve solo sus fotos → descarga. ✅ Implementado (verificar E2E tras `db push`).

**Pruebas:** Bib existente → N fotos · bib inexistente → empty state · <3s respuesta.

---

## Sprint 6 — Polish + Deploy Prod ✅

**Objetivo:** App production-ready en Vercel.

**Tareas:**
1. [x] Landing page `/` con propuesta de valor
2. [x] Error states, loading skeletons, empty states
3. [x] SEO meta tags en páginas públicas
4. [x] Guía deploy Vercel + env vars prod (`docs/deployment.md`)
5. [ ] Deploy Vercel ejecutado + smoke test prod (manual)

**Archivos creados:**
- `src/app/(public)/page.tsx`
- `src/components/shared/EmptyState.tsx`
- `src/components/ui/skeleton.tsx`
- `src/lib/seo.ts`
- `src/app/not-found.tsx`
- `src/app/(public)/e/[slug]/loading.tsx`
- `src/app/(dashboard)/organizer/events/loading.tsx`
- `src/app/(dashboard)/photographer/events/loading.tsx`
- `docs/deployment.md`

**DoD:** App accesible en dominio prod; flujo completo funciona end-to-end. *(Pendiente: ejecutar deploy)*

**Pruebas:** Smoke test prod: crear evento → upload → OCR → buscar bib.

---

## Sprint 7 — Beta Interna

**Objetivo:** Validar con 1 organizador + 1 fotógrafo reales (evento simulado).

**Tareas:**
1. Test con 500 fotos reales de carrera
2. Medir accuracy OCR; ajustar regex si necesario
3. Fix bugs críticos del feedback
4. Documentar runbook OCR (`docs/runbook-ocr.md`)
5. Performance: optimizar queries galería

**DoD:** 500 fotos procesadas; 3 corredores encuentran sus fotos sin ayuda.

**Pruebas:** Accuracy ≥85% · tiempo búsqueda <3s · 0 errores 500 en flujo principal.

---

## Sprint 8 — Primer Evento Real (gratis)

**Objetivo:** Evento deportivo real en producción, sin cobro — validar producto y generar caso de éxito.

**Tareas:**
1. Onboarding organizador real (evento piloto gratuito)
2. Soporte día-D (monitoring Inngest + Supabase)
3. Link público compartido en redes del evento
4. Recoger feedback corredores + métricas (OCR %, búsquedas, descargas)
5. Documentar caso de éxito para ventas

**DoD:** Evento completado; corredores usan búsqueda; organizador satisfecho; **doc caso de éxito listo**.

**Pruebas:** Métricas: N corredores buscaron · M fotos descargadas · uptime 99%+ · OCR ≥85%.

---

## Sprint 9+ — Monetización (post caso de éxito)

**Objetivo:** Activar cobros con Stripe usando el evento piloto como prueba social.

**Tareas:**
1. Integrar Stripe Checkout (planes Starter/Pro/Elite)
2. Límites por plan (500 / 5.000 / ilimitado fotos)
3. Landing con caso de éxito + testimonio organizador
4. Flujo: crear evento → elegir plan → pagar → activar
5. Billing dashboard organizador

**DoD:** Organizador nuevo puede pagar y crear evento de pago.

**Prerequisito:** Caso de éxito del Sprint 8 documentado.

---

## Sesión completada — 2025-06-23 (Sprint 6)

**Sprint:** 6  
**Tarea:** Polish UI + landing `/` + SEO + prep deploy prod

### Hecho
- [x] Landing `/` con propuesta de valor (organizador, fotógrafo, corredor) — reemplaza redirect a login
- [x] `EmptyState` reutilizable + skeletons en galería, dashboard y loading routes
- [x] Error states unificados (`error.tsx`, listados organizer/photographer, `PhotoGrid` empty)
- [x] SEO: `createPublicMetadata` con OpenGraph/Twitter en `/`, `/e/[slug]` y layout root
- [x] `not-found.tsx` para 404 público
- [x] `docs/deployment.md` — checklist Vercel + env vars + smoke test
- [x] `npm run build` OK

### Archivos tocados
- `src/app/(public)/page.tsx` — landing con CTAs login/register
- `src/components/shared/EmptyState.tsx` — empty/error states compartidos
- `src/components/ui/skeleton.tsx` — loading skeleton base
- `src/lib/seo.ts` — helper metadata pública
- `src/app/not-found.tsx` — página 404
- `src/app/(public)/e/[slug]/page.tsx` — EmptyState + SEO mejorado
- `src/app/(public)/e/[slug]/loading.tsx` — skeleton galería
- `src/app/(dashboard)/organizer/events/loading.tsx` — skeleton listado
- `src/app/(dashboard)/photographer/events/loading.tsx` — skeleton listado
- `src/app/(dashboard)/organizer/events/page.tsx` — EmptyState
- `src/app/(dashboard)/photographer/events/page.tsx` — EmptyState
- `src/components/photos/PhotoGrid.tsx` — EmptyState sin fotos
- `src/app/error.tsx` — error boundary unificado
- `src/app/layout.tsx` — metadataBase + SEO default
- `src/app/page.tsx` — eliminado (reemplazado por `(public)/page.tsx`)
- `docs/deployment.md` — guía deploy prod
- `.env.local.example` — nota `NEXT_PUBLIC_APP_URL` prod

### Docs actualizados
- [x] roadmap.md — Sprint 6 marcado ✓
- [x] README.md — estado actual
- [x] deployment.md — creado

### Próximo paso
**Deploy prod:** `vercel link` + configurar env vars (ver `docs/deployment.md`) + smoke test E2E en dominio prod.

### Blockers / decisiones pendientes
- Vercel CLI no instalada en máquina dev — deploy manual desde dashboard o `npm i -g vercel`
- Configurar `NEXT_PUBLIC_APP_URL` con URL prod tras primer deploy
- Supabase Auth: actualizar Site URL y redirect URLs al dominio prod
- Inngest: sync `/api/inngest` con URL prod + keys en Vercel

---

## Sesión completada — 2025-06-22 (Sprint 5)

**Sprint:** 5  
**Tarea:** Búsqueda bib + galería corredor (`/e/[slug]`, BibSearch, PhotoGrid, descarga watermark)

### Hecho
- [x] Página pública `/e/[slug]` sin auth — evento activo por slug + meta SEO
- [x] `BibSearch` con validación rango bib → query `photo_bibs` + `photos` ready
- [x] `PhotoGrid` con signed URLs (admin), lightbox y empty state
- [x] `GET /api/photos/[id]/download?bib=` — watermark "RacePics" con sharp
- [x] Migración RLS: `events_public_select`, `photos_public_select` (anon)
- [x] `npm run build` OK

### Archivos tocados
- `src/app/(public)/e/[slug]/page.tsx` — página corredor
- `src/components/events/BibSearch.tsx` — búsqueda por dorsal
- `src/components/photos/PhotoGrid.tsx` — galería + modal descarga
- `src/app/api/photos/[id]/download/route.ts` — descarga con watermark
- `src/lib/photos/bib-search.ts` — query bib + signed URLs
- `src/lib/photos/watermark.ts` — overlay sharp
- `supabase/migrations/20250721_sprint5_public_gallery.sql` — RLS público
- `next.config.mjs` — `sharp` en external packages
- `package.json` — dependencia `sharp`

### Docs actualizados
- [x] roadmap.md — Sprint 5 marcado ✓
- [x] README.md — estado actual

### Próximo paso
**Sprint 6:** Landing `/`, polish UI, deploy Vercel + smoke test prod.

### Blockers / decisiones pendientes
- Aplicar migración: `npx supabase db push` (políticas RLS públicas)
- Verificar DoD manual: `/e/{slug}?bib=123` con bib existente en evento activo
- Evento debe tener `status = 'active'` para ser visible al corredor

---

## Sesión completada — 2025-06-19

**Sprint:** 2 (cierre + estabilización cloud)  
**Tarea:** Supabase cloud, fixes RLS, crear eventos E2E

### Hecho
- [x] Supabase cloud configurado (`.env.local`, `link`, `db push`)
- [x] Perfil auto-creado (`ensureProfile`) + políticas RLS idempotentes (`20250703`)
- [x] Fixes redirect loop, caché Next.js (`dev:clean`), error boundaries
- [x] Organizador crea y ve eventos en `/organizer/events` — **DoD verificado**

### Archivos tocados
- `supabase/migrations/20250701_grants.sql`, `20250702_*`, `20250703_ensure_rls_policies.sql`
- `src/lib/auth/profile.ts` — `ensureProfile`, `wrongRoleRedirectPath`
- `src/middleware.ts`, `src/app/(dashboard)/layout.tsx`, `organizer/events/actions.ts`
- `src/app/error.tsx`, `src/app/global-error.tsx`
- `package.json` — scripts `clean`, `dev:clean`

### Docs actualizados
- [x] roadmap.md — Sprint 2 verificado ✓
- [x] README.md — estado + setup cloud
- [x] stack-tecnologico.md — setup dev cloud + puerto 3002

### Próximo paso
Sprint 3: bucket `photos`, `POST /api/upload`, UI upload fotógrafo.

### Blockers / decisiones pendientes
- **Decisión dev:** Supabase cloud only (sin Docker local). Puertos: RacePics = **3002** (3000/3001 ocupados por otras apps).
- Si `db push` falla por “already exists”: `migration repair <version> --status applied` y reintentar.

---

## Sesión completada — 2025-06-22 (cierre E2E)

**Sprint:** 4  
**Tarea:** Verificación pipeline OCR E2E + fixes dev (GCP, Inngest, UI contadores)

### Hecho
- [x] 11 fotos `process-photo` Completed en Inngest dev
- [x] DB: 11 `ready`, 26 filas `photo_bibs`, 10/11 fotos con dorsal (~91% OCR) — **DoD verificado**
- [x] Fixes: `INNGEST_DEV=1`, credenciales GCP (BOM JSON), Vision billing, refresh contadores UI
- [x] Dev estable: `npm run dev` + `npm run inngest:dev` en paralelo

### Archivos tocados (sesión verificación)
- `src/lib/vision/ocr.ts` — carga credenciales + strip BOM
- `src/lib/photos/processing-stats.ts` — `noStore` + `force-dynamic`
- `src/components/photos/ProcessPendingButton.tsx` — `router.refresh()` post-encolar
- `src/app/(dashboard)/organizer/events/*` — `dynamic = force-dynamic`
- `.env.local.example` — `INNGEST_DEV=1`, `GOOGLE_CREDENTIALS_JSON`
- `next.config.mjs` — `serverComponentsExternalPackages` Vision
- `.gitignore` — `secrets/`

### Docs actualizados
- [x] roadmap.md — Sprint 4 DoD verificado ✓
- [x] README.md — estado actual

### Próximo paso
**Sprint 5:** `/e/[slug]` + `BibSearch` + `PhotoGrid` + descarga con watermark.

### Blockers / decisiones pendientes
- Dev OCR: 2 terminales (`npm run dev` + `npm run inngest:dev`); GCP billing + Vision API habilitada.
- `secrets/gcp-vision.json` no commitear; `GOOGLE_CLOUD_PROJECT_ID` = `project_id` del JSON (no el número de proyecto).

---

## Sesión completada — 2025-06-22 (Sprint 4)

**Sprint:** 4  
**Tarea:** Pipeline OCR (Inngest + Google Vision) + contadores organizador

### Hecho
- [x] Inngest: cliente, `/api/inngest`, function `process-photo` con retries + onFailure
- [x] Google Vision wrapper: `TEXT_DETECTION` → filtro `bib_min`/`bib_max` → validación referencia (D10)
- [x] Migración `photo_bibs` + RLS (organizer, photographer, público ready)
- [x] Trigger `photo/uploaded` tras upload Storage (`/api/photos/[id]/process`)
- [x] Botón organizador "Procesar pendientes" para las 11 fotos previas
- [x] UI contadores pending/processing/ready/failed + % OCR en listado y edición evento

### Archivos tocados
- `inngest/functions/process-photo.ts` — pipeline OCR async
- `src/lib/vision/ocr.ts` — wrapper Vision + filtrado bibs
- `src/lib/inngest/client.ts` — cliente Inngest
- `src/app/api/inngest/route.ts` — endpoint serve
- `src/app/api/photos/[id]/process/route.ts` — trigger post-upload
- `src/app/api/events/[id]/process-pending/route.ts` — batch pendientes
- `supabase/migrations/20250714_sprint4_photo_bibs.sql`
- `src/components/photos/PhotoStatusSummary.tsx`, `ProcessPendingButton.tsx`
- `src/lib/photos/processing-stats.ts`
- `src/hooks/usePhotoUpload.ts` — encola OCR tras subida
- `src/app/(dashboard)/organizer/events/*` — contadores
- `package.json` — `inngest`, `@google-cloud/vision`, script `inngest:dev`

### Docs actualizados
- [x] roadmap.md — Sprint 4 verificado ✓
- [x] README.md — estado actual

### Próximo paso
**Sprint 5:** Página pública `/e/[slug]` + `BibSearch` + galería corredor.

### Blockers / decisiones pendientes
- Aplicar migración: `npx supabase db push`
- Dev OCR: terminal 1 `npm run dev`, terminal 2 `npm run inngest:dev`
- Configurar `GOOGLE_APPLICATION_CREDENTIALS` + `GOOGLE_CLOUD_PROJECT_ID` en `.env.local`
- Inngest dev no requiere keys en local; prod sí (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`)

---

## Sesión completada — 2025-06-22 (cierre)

**Sprint:** 3  
**Tarea:** Upload fotos + Storage — verificación E2E + fixes RLS

### Hecho
- [x] Upload 11 fotos: progreso 11/11, Storage `photos` + DB `pending` — **DoD verificado**
- [x] Fixes RLS recursión: `20250708` (profiles), `20250709` (events ↔ event_photographers)
- [x] Dev estable: `dev:clean`, puerto 3002, `/` → `/login`
- [x] Flujo completo: organizador crea evento → invita fotógrafo → sube fotos

### Archivos tocados (sesión completa Sprint 3)
- `supabase/migrations/20250707_*`, `20250708_*`, `20250709_*`
- `src/app/api/upload/route.ts`, `src/hooks/usePhotoUpload.ts`, `src/components/photos/UploadZone.tsx`
- `src/app/(dashboard)/photographer/events/*`, `src/lib/photos/storage-path.ts`
- `src/app/page.tsx` — redirect a login

### Docs actualizados
- [x] roadmap.md — Sprint 3 verificado ✓
- [x] README.md — estado actual

### Próximo paso
**Sprint 4:** Inngest dev + `/api/inngest` + `process-photo` (Vision OCR) + tabla `photo_bibs` + trigger `photo/uploaded`.

### Blockers / decisiones pendientes
- Sin galería de fotos en UI (esperado; llega en Sprint 4 contador organizador, Sprint 5 galería corredor).
- Google Cloud Vision: configurar `GOOGLE_APPLICATION_CREDENTIALS` antes de Sprint 4.
- Dev: un solo `npm run dev` en puerto 3002; si 404/CSS roto → `npm run dev:clean`.

---

## Sesión completada — 2025-06-22

**Sprint:** 3  
**Tarea:** Upload fotos + Storage (bucket `photos`, signed URL, UI drag & drop)

### Hecho
- [x] Migración `20250707`: tabla `photos`, bucket `photos`, RLS DB + Storage
- [x] `POST /api/upload` — valida fotógrafo invitado, insert `pending`, signed URL (D5)
- [x] UI drag & drop en `/photographer/events/[id]/upload` con progress bar
- [x] Listado fotógrafo con enlace "Subir fotos" por evento invitado
- [x] Migración aplicada en Supabase cloud (`db push`)

### Archivos tocados
- `supabase/migrations/20250707_sprint3_photos_storage.sql` — schema + policies
- `src/app/api/upload/route.ts` — signed URL endpoint
- `src/hooks/usePhotoUpload.ts` — cola concurrente (5), upload directo Storage
- `src/components/photos/UploadZone.tsx` — drag & drop + lista progreso
- `src/app/(dashboard)/photographer/events/[id]/upload/page.tsx` — página upload
- `src/app/(dashboard)/photographer/events/page.tsx` — listado eventos invitados
- `src/lib/photos/storage-path.ts` — paths `{event_id}/original/{photo_id}.ext`
- `src/types/database.ts` — tipos `Photo`, `PhotoStatus`
- `src/app/(dashboard)/layout.tsx` — nav fotógrafo

### Docs actualizados
- [x] roadmap.md — Sprint 3 marcado ✓
- [x] README.md — estado actual

### Próximo paso
Sprint 4: Inngest + Google Vision OCR (`process-photo`, trigger `photo/uploaded`).

### Blockers / decisiones pendientes
- Verificar DoD manual: subir 50 JPG como fotógrafo invitado → bucket `photos` + 50 rows `pending`.
- Docker no disponible (solo cloud); warning de cache migrations catalog es benigno.

---

## Sesión completada — 2025-06-19

**Sprint:** 2  
**Tarea:** Auth Supabase + middleware + CRUD eventos organizador

### Hecho
- [x] Login y registro email/password con selección de rol (organizer | photographer)
- [x] Middleware protege `/organizer/*` y `/photographer/*` por sesión y rol
- [x] CRUD eventos: listado, crear, editar en `/organizer/events`
- [x] Config bib_min/bib_max + upload imagen referencia dorsal (bucket `events`)
- [x] Slug único auto-generado desde nombre + invitar fotógrafo por email
- [x] Migración RLS, `event_photographers`, storage policies

### Archivos tocados
- `src/middleware.ts` — protección rutas + refresh sesión Supabase
- `src/lib/supabase/middleware.ts` — helper sesión SSR
- `src/app/(auth)/login/*`, `register/page.tsx` — auth UI funcional
- `src/app/(dashboard)/layout.tsx` — shell dashboard + logout
- `src/app/(dashboard)/organizer/events/*` — listado, crear, editar, server actions
- `src/components/events/EventForm.tsx` — formulario evento + upload bib ref
- `src/components/events/InvitePhotographerForm.tsx` — invitar fotógrafo
- `src/lib/events/slug.ts` — slugify + unicidad
- `src/types/database.ts` — tipos Profile, Event, UserRole
- `supabase/migrations/20250630_sprint2_auth_rls.sql` — RLS, invites, storage

### Docs actualizados
- [x] roadmap.md — Sprint 2 marcado ✓
- [x] README.md — estado actual

### Próximo paso
Sprint 3: bucket `photos`, signed URL upload, UI drag & drop en `/photographer/events/[id]/upload`.

### Blockers / decisiones pendientes
- Docker no instalado en máquina de dev — ejecutar `npm run db:reset` tras instalar Docker para aplicar migración Sprint 2.

---

## Sesión completada — 2025-06-19

**Sprint:** 1  
**Tarea:** Scaffold Next.js 14 + Supabase init

### Hecho
- [x] Next.js 14 (App Router, TS, Tailwind, `src/`) inicializado
- [x] shadcn/ui: Button, Input, Card, Dialog
- [x] Supabase CLI + `supabase init` + migración `profiles` / `events`
- [x] Clients `client.ts`, `server.ts`, `admin.ts`
- [x] `.env.local.example` + página `/login` renderizando

### Archivos tocados
- `package.json` — dependencias Next/Supabase/shadcn + scripts `db:*`
- `src/lib/supabase/*` — clients browser/server/admin
- `supabase/migrations/20250623_init.sql` — schema inicial
- `src/app/(auth)/login/page.tsx` — UI login con shadcn
- `.env.local.example` — template env vars
- `components.json`, `tailwind.config.ts`, `src/app/globals.css` — shadcn/Tailwind

### Docs actualizados
- [x] roadmap.md — Sprint 1 marcado ✓
- [x] README.md — estado actual

### Próximo paso
Sprint 2: Auth Supabase (email/password) + middleware + CRUD eventos en `/organizer/events`.

### Blockers / decisiones pendientes
- Docker no instalado en máquina de dev — ejecutar `npm run db:start` tras instalar Docker Desktop para aplicar migración y obtener keys locales.

---

## Sesión completada — 2025-06-19

**Sprint:** 0  
**Tarea:** Documentación inicial del proyecto

### Hecho
- [x] 8 archivos docs creados
- [x] Decisiones arquitectura D1-D9
- [x] Roadmap 8 sprints definido
- [x] Protocolo sesiones + prompt <150 tokens

### Docs actualizados
- [x] Todos los archivos en `docs/`

### Próximo paso
Sprint 1: `create-next-app` + Supabase init (ver tareas arriba).

### Blockers
- Ninguno
