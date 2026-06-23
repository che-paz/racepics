# Deployment — RacePics

> Primera guía de deploy a producción (Sprint 6).  
> Stack: Vercel (Next.js) · Supabase cloud · Inngest cloud · Google Vision

---

## Checklist pre-deploy

- [ ] `npm run build` pasa sin errores en local
- [ ] Migraciones aplicadas en Supabase prod: `npx supabase db push`
- [ ] RLS auditado (políticas públicas en `events`, `photos`, `photo_bibs`)
- [ ] Credenciales GCP con billing + Vision API habilitada
- [ ] Proyecto Inngest creado y app sincronizada con `/api/inngest`

---

## 1. Vercel — crear proyecto

```bash
# Instalar CLI (una vez)
npm i -g vercel

# Desde la raíz del repo
vercel login
vercel link
```

En el dashboard de Vercel:

1. **Import** el repositorio Git (recomendado) o deploy manual
2. Framework preset: **Next.js**
3. Root directory: `.`
4. Build command: `npm run build`
5. Output: default (Next.js)

---

## 2. Variables de entorno (Production)

Configurar en Vercel → Project → Settings → Environment Variables.

| Variable | Entorno | Notas |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | **Secret** — solo server |
| `NEXT_PUBLIC_APP_URL` | Production | `https://tu-dominio.vercel.app` o dominio custom |
| `GOOGLE_CLOUD_PROJECT_ID` | Production, Preview | `project_id` del service account JSON |
| `GOOGLE_CREDENTIALS_JSON` | Production, Preview | Contenido completo del JSON (inline, una línea) |
| `INNGEST_EVENT_KEY` | Production | Desde dashboard Inngest |
| `INNGEST_SIGNING_KEY` | Production | Desde dashboard Inngest |

**No usar en prod:** `INNGEST_DEV=1` ni `GOOGLE_APPLICATION_CREDENTIALS` (ruta local).

Sincronizar a local (opcional):

```bash
vercel env pull .env.local
```

---

## 3. Supabase — producción

1. Usar el mismo proyecto cloud de dev o crear uno dedicado prod
2. Auth → URL Configuration:
   - **Site URL:** `https://tu-dominio.vercel.app`
   - **Redirect URLs:** `https://tu-dominio.vercel.app/**`
3. Aplicar migraciones:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

4. Verificar buckets: `photos`, `events` con policies activas

---

## 4. Inngest — producción

1. Crear app en [app.inngest.com](https://app.inngest.com)
2. Añadir URL de sync: `https://tu-dominio.vercel.app/api/inngest`
3. Copiar `INNGEST_EVENT_KEY` y `INNGEST_SIGNING_KEY` a Vercel
4. Verificar que las functions `process-photo` y `export-event-photos` aparecen como synced

---

## 5. Deploy

```bash
# Preview
vercel

# Producción
vercel --prod
```

O push a `main` si el repo está conectado a Vercel (auto-deploy).

---

## 6. Smoke test post-deploy

Ejecutar en prod con usuario organizador de prueba:

1. **Landing** — `/` muestra propuesta de valor (no redirect a login)
2. **Auth** — registro/login organizador
3. **Evento** — crear evento, activar (`status = active`)
4. **Upload** — fotógrafo invitado sube 2–3 fotos
5. **OCR** — Inngest dashboard: `process-photo` Completed
6. **Galería** — `/e/{slug}?bib=123` con bib existente → fotos visibles
7. **Descarga** — watermark en `GET /api/photos/[id]/download?bib=`
8. **Compartir** — botones WA/FB/X en modal de foto
9. **Export** — organizador genera ZIPs desde editar evento (opcional smoke)

---

## Dominio custom (opcional)

1. Vercel → Domains → añadir dominio
2. Actualizar `NEXT_PUBLIC_APP_URL` a `https://racepics.app` (o tu dominio)
3. Actualizar Site URL en Supabase Auth
4. Re-sync Inngest si cambia la URL base

---

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---------|----------------|-----|
| OCR no corre | Inngest no synced / keys faltantes | Revisar `/api/inngest` + env vars |
| Vision 403 | Billing o API deshabilitada | GCP console |
| Fotos no cargan en galería | RLS o `status != ready` | `db push` + revisar `photo_bibs` |
| Auth redirect loop | Site URL incorrecta en Supabase | Auth settings |
| Build falla en sharp | OK en Vercel por defecto | `serverComponentsExternalPackages` ya configurado |

---

## Referencias

- Env vars detalladas → [decisiones-arquitectura.md](./decisiones-arquitectura.md)
- Stack setup → [stack-tecnologico.md](./stack-tecnologico.md)
- Roadmap Sprint 6 → [roadmap.md](./roadmap.md)
