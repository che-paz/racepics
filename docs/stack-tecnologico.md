# Stack Tecnológico — RacePics

> Última actualización: 2025-06-19 (setup cloud verificado)

---

## Resumen

| Capa | Tecnología | Versión target |
|------|-----------|----------------|
| Frontend | Next.js (App Router) | 14.x |
| UI | Tailwind CSS + shadcn/ui | Tailwind 3.x |
| Backend/DB | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth | — |
| Storage | Supabase Storage | — |
| OCR | Google Cloud Vision API | v1 |
| Async jobs | Inngest | Latest |
| Deploy | Vercel | — |
| Lenguaje | TypeScript | 5.x |

---

## Next.js 14

```bash
npx create-next-app@14 racepics --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Config clave (`next.config.js`):**
- `images.remotePatterns` → dominio Supabase Storage
- Server Actions habilitadas para forms simples

**Convención:** Server Components por default; `'use client'` solo en interactividad.

**Puerto dev:** `3002` (configurado en `package.json`). Otras apps del dev pueden usar 3000, 3001, etc.

---

## Supabase

### Setup local
```bash
npm install supabase --save-dev
npx supabase init
npx supabase start        # Docker required
npx supabase db reset     # Aplica migraciones + seed
```

### Proyecto cloud
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar URL + anon key + service role key → `.env.local`
3. `npx supabase login`
4. `npx supabase link --project-ref <ref>`
5. `npx supabase db push` para migraciones

**Auth (dashboard):** Email provider ON · Confirm email OFF (dev) · Site URL `http://localhost:3002`

**Migraciones parciales:** Si `db push` falla con “already exists”, marcar versión aplicada:
```bash
npx supabase migration repair 20250623 --status applied
npx supabase db push
```
Migración `20250703_ensure_rls_policies.sql` reaplica RLS/policies de forma idempotente.

### Setup dev actual (RacePics)

| Item | Valor |
|------|-------|
| Supabase | **Cloud** (sin Docker local) |
| Puerto app | **3002** (`npm run dev`) |
| Env | `.env.local` — URL, anon key, service role key |
| Limpiar caché | `npm run dev:clean` |

```bash
npm run dev          # http://localhost:3002
npm run dev:clean    # borra .next + arranca
npx supabase db push # aplicar migraciones a cloud
```

### Storage
- Bucket: `photos` (private)
- Max file: 15 MB
- MIME: `image/jpeg`, `image/png`
- Acceso: signed URLs (1h expiry para viewing)

### Auth (MVP)
- Provider: email/password
- Redirect: `/organizer/events` (organizer), `/photographer/events` (photographer)
- Trigger: auto-create `profiles` row on signup

---

## Tailwind + shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button input card dialog toast form select
```

**Tema:** CSS variables en `globals.css`. Brand colors TBD.

**Componentes base MVP:** Button, Input, Card, Dialog, Toast (sonner), Form.

---

## Google Cloud Vision

### Setup
1. Proyecto GCP con billing habilitado
2. Habilitar Cloud Vision API
3. Service account con rol `Cloud Vision API User`
4. Descargar JSON key

### Uso
```typescript
// src/lib/vision/ocr.ts
import vision from '@google-cloud/vision';
// TEXT_DETECTION → regex /\b(\d{3,5})\b/ → bib candidates
```

**Coste estimado MVP:** ~$1.50/1000 fotos (TEXT_DETECTION).

**Local:** `GOOGLE_APPLICATION_CREDENTIALS=./secrets/gcp-key.json`  
**Vercel:** `GOOGLE_CREDENTIALS_JSON` = contenido del JSON inline.

---

## Inngest

### Setup
```bash
npm install inngest
npx inngest-cli@latest dev    # Dev server localhost:8288
```

### Endpoint
```typescript
// src/app/api/inngest/route.ts
export { GET, POST, PUT } from '@/lib/inngest/serve';
```

### Function MVP
```typescript
// inngest/functions/process-photo.ts
inngest.createFunction(
  { id: 'process-photo', retries: 3 },
  { event: 'photo/uploaded' },
  async ({ event, step }) => { /* OCR pipeline */ }
);
```

**Env vars:** `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` (desde dashboard Inngest).

---

## Vercel

### Deploy
```bash
vercel link
vercel env pull .env.local    # Sync env vars
vercel --prod
```

### Env vars requeridas (Production)
Todas las listadas en `decisiones-arquitectura.md`.

### Integraciones
- Inngest: auto-detect `/api/inngest` endpoint
- Supabase: no integration nativa; env vars manuales

---

## Dependencias npm (Sprint 1)

```json
{
  "dependencies": {
    "next": "^14",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0",
    "inngest": "^3",
    "@google-cloud/vision": "^4",
    "tailwindcss": "^3",
    "class-variance-authority": "^0",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "lucide-react": "^0",
    "sonner": "^1",
    "sharp": "^0"
  },
  "devDependencies": {
    "typescript": "^5",
    "supabase": "^1",
    "@types/node": "^20"
  }
}
```

---

## Entornos

| Entorno | Next.js | Supabase | Inngest | Vision |
|---------|---------|----------|---------|--------|
| Local | `localhost:3000` | Docker local | `inngest dev` | GCP project dev |
| Preview | Vercel preview URL | Supabase staging | Inngest cloud | GCP dev |
| Production | racepics.app | Supabase prod | Inngest cloud | GCP prod |

---

## Supabase Edge Functions (no MVP)

Reservadas para webhooks ligeros post-MVP (ej. Stripe). Pipeline OCR usa Inngest (ver D3 en decisiones-arquitectura.md).
