# Estructura del Proyecto — RacePics

> Última actualización: 2025-06-19

## Árbol de carpetas

```
racepics/
├── docs/                          # Memoria del proyecto (leer primero en cada sesión)
│
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (auth)/                # Rutas públicas de auth (login, registro)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (public)/              # Rutas públicas sin auth
│   │   │   ├── e/[slug]/          # Página del evento (búsqueda por bib)
│   │   │   └── page.tsx           # Landing
│   │   ├── (dashboard)/           # Rutas protegidas por rol
│   │   │   ├── organizer/         # Panel organizador
│   │   │   ├── photographer/      # Panel fotógrafo
│   │   │   └── layout.tsx
│   │   ├── api/                   # Route Handlers (webhooks, endpoints ligeros)
│   │   │   ├── inngest/           # Endpoint Inngest
│   │   │   ├── upload/            # Signed URL para subida directa a Storage
│   │   │   └── webhooks/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui (Button, Input, Dialog…)
│   │   ├── events/                # EventCard, EventForm, BibSearch
│   │   ├── photos/                # PhotoGrid, PhotoCard, UploadZone
│   │   ├── layout/                # Header, Footer, Sidebar, Nav
│   │   └── shared/                # Loading, ErrorBoundary, EmptyState
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client (cookies)
│   │   │   └── admin.ts           # Service role (solo server/Inngest)
│   │   ├── vision/                # Google Cloud Vision OCR wrapper
│   │   ├── inngest/               # Cliente + funciones async
│   │   ├── storage/               # Helpers upload/download Supabase Storage
│   │   ├── utils.ts               # cn(), formatters
│   │   └── constants.ts           # Planes, límites, config estática
│   │
│   ├── hooks/                     # useEvent, usePhotos, useUpload
│   ├── types/                     # Tipos TS (Event, Photo, User, BibResult)
│   └── middleware.ts              # Auth + protección de rutas por rol
│
├── supabase/
│   ├── migrations/                # SQL versionado (schema, RLS, funciones)
│   ├── seed.sql                   # Datos de desarrollo
│   └── config.toml                # Config local Supabase CLI
│
├── inngest/
│   └── functions/                 # Definición de jobs async
│       ├── process-photo.ts       # OCR → indexar bib → actualizar estado
│       └── notify-runner.ts       # (post-MVP) email/WhatsApp
│
├── public/
│   ├── images/                    # Assets estáticos
│   └── fonts/
│
├── scripts/                       # Utilidades CLI (seed, migración, test OCR)
│
├── .env.local.example             # Template de variables (sin valores)
├── components.json                # Config shadcn/ui
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Qué vive en cada zona

| Carpeta | Responsabilidad |
|---------|-----------------|
| `docs/` | Decisiones, roadmap, protocolos. Fuente de verdad del proyecto. |
| `src/app/(public)/e/[slug]` | Experiencia del corredor: buscar bib → ver fotos. Core del MVP. |
| `src/app/(dashboard)/organizer` | CRUD eventos, invitar fotógrafos, ver estado de procesamiento. |
| `src/app/(dashboard)/photographer` | Subida masiva de fotos a un evento. |
| `src/app/api/upload` | Genera signed URLs; la subida va directo a Supabase Storage. |
| `src/lib/vision` | Llama Google Cloud Vision API para detectar números de bib. |
| `inngest/functions` | Pipeline async: foto subida → OCR → guardar bibs → marcar procesada. |
| `supabase/migrations` | Schema DB, políticas RLS, triggers (ej. encolar job al insertar foto). |
| `src/components/ui` | Componentes shadcn; no editar manualmente salvo customización. |
| `src/middleware.ts` | Redirige no autenticados; bloquea rutas por rol (organizer/photographer). |

## Principios de organización

1. **Colocation por feature en components/** — `events/`, `photos/`, no carpetas por tipo técnico.
2. **Lógica de negocio en `lib/`** — components solo renderizan; hooks conectan UI ↔ lib.
3. **Async fuera del request** — OCR nunca en Route Handler síncrono; siempre Inngest.
4. **Upload directo a Storage** — el servidor no proxyea bytes de imagen.
5. **RLS en Supabase** — autorización en DB, no solo en middleware.

## Rutas principales (MVP)

| Ruta | Actor | Propósito |
|------|-------|-----------|
| `/e/[slug]` | Corredor | Buscar bib, ver fotos |
| `/organizer/events` | Organizador | Gestionar eventos |
| `/organizer/events/[id]` | Organizador | Detalle, rango bib, foto referencia, fotógrafos |
| `/photographer/events/[id]/upload` | Fotógrafo | Subir fotos |
| `/login` | Todos | Auth Supabase |
