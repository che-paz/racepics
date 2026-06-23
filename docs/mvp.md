# MVP — RacePics

> Última actualización: 2025-06-19 (P1, P2)

## Problema core

> *"El corredor busca su número de bib y ve solo sus fotos en segundos."*

## Las 3 funciones imprescindibles

### 1. Crear evento y subir fotos
- Organizador crea evento (nombre, fecha, slug público).
- Organizador o fotógrafo configura **rango de bib** (ej. 1–5000) e **imagen de referencia** del dorsal (opcional, mejora OCR).
- Fotógrafo sube fotos al evento (drag & drop, batch).
- Sistema procesa fotos en background (OCR filtrado por rango + referencia) sin intervención manual.

### 2. Buscar por número de bib
- Corredor entra a `/e/[slug]` sin registrarse.
- Introduce su número de bib.
- Ve galería filtrada con solo sus fotos en <3 segundos.

### 3. Descargar / compartir foto individual
- Corredor puede ver foto en tamaño completo.
- Descarga la imagen (con watermark básico del organizador).
- Comparte link directo a la foto.

**Nada más.** Sin pagos, sin analytics, sin notificaciones automáticas en MVP.

---

## Fuera del MVP (backlog)

| Feature | Prioridad post-MVP |
|---------|-------------------|
| Pagos Stripe (planes Starter/Pro/Elite) | P0 — post caso de éxito (Sprint 9+) |
| Registro/login de corredores | P1 |
| Email/WhatsApp cuando fotos listas | P1 |
| Analytics de alcance en redes | P2 |
| Watermark dinámico con handle organizador | P2 |
| Posts automáticos AI para redes | P3 |
| Múltiples fotógrafos por evento con créditos | P2 |
| Búsqueda por rostro (face recognition) | P3 |
| App móvil | P3 |
| White-label para organizadores | P3 |

---

## Roles mínimos (MVP)

| Rol | Auth | Permisos MVP |
|-----|------|--------------|
| **Organizador** | Sí (Supabase Auth) | Crear/editar eventos, invitar fotógrafos, ver progreso upload |
| **Fotógrafo** | Sí | Subir fotos a eventos donde fue invitado |
| **Corredor** | No | Buscar bib en página pública del evento |

> MVP no requiere cuenta de corredor. Acceso anónimo por URL + bib.

---

## Happy path

```
ORGANIZADOR                          FOTÓGRAFO                         CORREDOR
     │                                    │                                │
     ├─ Registro/login                    │                                │
     ├─ Crear evento "Maratón X"          │                                │
     │  slug: maraton-x-2025              │                                │
     │  rango bib 1-5000 + foto dorsal    │                                │
     ├─ Invitar fotógrafo (email)         │                                │
     │                                    ├─ Acepta invitación             │
     │                                    ├─ Sube 200 fotos (batch)        │
     │                                    │                                │
     │  [Inngest procesa OCR en bg]       │                                │
     │  Estado: 200/200 procesadas ✓      │                                │
     │                                    │                                │
     ├─ Comparte link público ────────────────────────────────────────────►│
     │  racepics.app/e/maraton-x-2025     │                                │
     │                                    │                                ├─ Abre link
     │                                    │                                ├─ Escribe bib: 1847
     │                                    │                                ├─ Ve 4 fotos suyas
     │                                    │                                └─ Descarga/comparte
```

**Tiempo objetivo corredor:** bib → fotos visibles en **<5 segundos** (post-procesamiento).

---

## Criterios de éxito del MVP

- [ ] 1 evento real con 500+ fotos procesadas
- [ ] OCR detecta bib correctamente en ≥85% de fotos con bib visible
- [ ] Corredor encuentra sus fotos sin ayuda
- [ ] Organizador completa flujo sin soporte técnico
- [ ] Deploy estable en Vercel + Supabase prod
- [ ] Caso de éxito documentado (métricas + testimonio organizador) para activar cobros

## Límites técnicos MVP

- Máx **1 organizador** y **1 fotógrafo** por evento
- Máx **5,000 fotos** por evento (límite piloto / plan Pro)
- Formatos: JPG, PNG. Máx 15 MB/foto
- **Sin pagos** — evento piloto 100% gratis; monetización después del caso de éxito
