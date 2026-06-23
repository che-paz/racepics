# Decisiones de Arquitectura — RacePics

> Última actualización: 2025-06-19 (P1, P2 cerradas)  
> Si no está aquí, no es decisión oficial.

---

## Decisiones tomadas

| # | Decisión | Razón | Alternativa descartada |
|---|----------|-------|-------------------------|
| D1 | **Next.js 14 App Router** | SSR para SEO en landing/eventos; Route Handlers para webhooks | Pages Router (legacy) |
| D2 | **Supabase** para DB + Auth + Storage | Stack unificado, RLS nativo, signed URLs | Firebase, PlanetScale + S3 |
| D3 | **Inngest** para procesamiento async | Retries, observabilidad, steps en pipeline OCR | Supabase Edge Functions (límite 150s, menos tooling) |
| D4 | **Google Cloud Vision API** para OCR | Precisión en números impresos, API madura | Tesseract self-hosted, AWS Rekognition |
| D5 | **Upload directo a Storage** | No saturar Vercel con bytes; signed URL desde API | Upload via Route Handler |
| D6 | **RLS como capa de autorización** | Seguridad en DB aunque haya bug en frontend | Solo middleware Next.js |
| D7 | **Corredor anónimo en MVP** | Reduce fricción; core es búsqueda por bib | Auth obligatoria para ver fotos |
| D8 | **shadcn/ui** | Componentes copiables, Tailwind nativo, sin lock-in | MUI, Chakra |
| D9 | **Vercel** deploy | Integración nativa Next.js, preview deploys | Railway, Fly.io |
| D10 | **Config OCR por evento** | Organizador/fotógrafo define rango de bib + sube imagen de referencia del dorsal | Regex fijo global `\d{3,5}` |
| D11 | **Beta gratis → monetización** | Primer evento real sin cobro; caso de éxito documentado antes de activar Stripe | Cobrar desde sprint 5-6 |

### D10 — Detalle: configuración de bib por evento

- **Quién configura:** Organizador al crear evento; fotógrafo puede ajustar si el organizador lo permite (MVP: ambos pueden editar en su evento).
- **Rango numérico:** `bib_min` / `bib_max` (ej. 1–9999). OCR solo acepta números dentro del rango.
- **Imagen de referencia (opcional):** Foto del dorsal de muestra → Storage `events/{id}/bib-reference.jpg`.
- **Uso en OCR:** Vision `TEXT_DETECTION` + filtro por rango + validación cruzada con tipografía/formato de la referencia (post-proceso en `lib/vision/`).
- **Fallback:** Si no hay imagen de referencia, OCR funciona solo con rango numérico.

### D11 — Detalle: estrategia comercial

1. MVP + primer evento real = **100% gratis** (sin límite artificial de plan).
2. Recoger métricas del evento: fotos procesadas, % OCR, corredores que buscaron, descargas.
3. Documentar **caso de éxito** (organizador + testimonio + números).
4. **Después** implementar Stripe (Starter/Pro/Elite) usando el caso de éxito en landing y ventas.

---

## Variables de entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Cloud Vision
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=    # JSON service account (local)
# En Vercel: GOOGLE_CREDENTIALS_JSON=  # JSON inline

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# App
NEXT_PUBLIC_APP_URL=               # https://racepics.app
```

> Valores reales en `.env.local` (local) y Vercel env vars (prod). Nunca commitear.

---

## Convenciones de código

| Área | Convención |
|------|-----------|
| Lenguaje | TypeScript strict |
| Componentes | PascalCase, default export, `'use client'` solo si necesario |
| Hooks | `use` prefix, camelCase |
| Utilidades | camelCase, funciones puras en `lib/` |
| Route Handlers | `route.ts`, métodos HTTP explícitos |
| Server Components | Default; fetch con Supabase server client |
| Errores | `throw` en server; toast en client via sonner |
| Imports | `@/` alias → `src/` |

---

## Nomenclatura

### Base de datos (Supabase/PostgreSQL)

| Elemento | Patrón | Ejemplo |
|----------|--------|---------|
| Tablas | snake_case, plural | `events`, `photos`, `photo_bibs` |
| Columnas | snake_case | `created_at`, `event_id`, `storage_path` |
| PKs | `id` UUID | `gen_random_uuid()` |
| FKs | `{tabla_singular}_id` | `event_id` |
| Índices | `idx_{tabla}_{columnas}` | `idx_photos_event_id` |
| RLS policies | `{tabla}_{rol}_{accion}` | `photos_public_select` |
| Enums | snake_case tipo | `photo_status: pending \| processing \| ready \| failed` |

### Archivos

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Páginas | `page.tsx` en carpeta de ruta | `app/(public)/e/[slug]/page.tsx` |
| Componentes | PascalCase.tsx | `PhotoGrid.tsx` |
| Hooks | camelCase.ts | `usePhotoUpload.ts` |
| Tipos | `{dominio}.ts` | `types/photo.ts` |
| Migraciones | `{timestamp}_{desc}.sql` | `20250619_init_schema.sql` |

### Storage (Supabase)

```
events/{event_id}/bib-reference.jpg       # Dorsal de muestra (opcional)
events/{event_id}/original/{photo_id}.jpg
events/{event_id}/thumb/{photo_id}.webp
```

---

## Integraciones externas

### Supabase
- **Auth:** email/password MVP; magic link post-MVP
- **Storage bucket:** `photos` (privado); acceso via signed URLs
- **RLS:** corredor lee fotos `ready` de evento público; fotógrafo escribe en su evento

### Google Cloud Vision
- **API:** `TEXT_DETECTION` + filtro por rango `bib_min`–`bib_max` del evento
- **Referencia:** Si existe `bib_reference_path`, usar en post-proceso para validar formato/tipografía detectada
- **Auth:** service account JSON
- **Llamada desde:** Inngest function `process-photo`, nunca desde client

### Inngest
- **Trigger:** evento `photo/uploaded` emitido tras insert en DB o Storage webhook
- **Functions:** `process-photo` (OCR + index), `notify-runner` (post-MVP)
- **Endpoint:** `/api/inngest` Route Handler

### Vercel
- **Regions:** `iad1` (cercano a Supabase US)
- **Env vars:** todas las de arriba en Production + Preview

---

## Schema DB (MVP — referencia)

```
events          → id, organizer_id, name, slug, date, status,
                  bib_min, bib_max, bib_reference_path, created_at
event_photographers → event_id, photographer_id, invited_at
photos          → id, event_id, photographer_id, storage_path, status, uploaded_at
photo_bibs      → photo_id, bib_number (indexado para búsqueda)
profiles        → id (= auth.users.id), role, display_name
```

---

## Decisiones cerradas (histórico)

| ID | Decisión | Fecha |
|----|----------|-------|
| P1 | Rango configurable por evento + imagen de referencia del bib (organizador/fotógrafo) | 2025-06-19 |
| P2 | Prueba gratis; Stripe solo tras caso de éxito del primer evento real | 2025-06-19 |
