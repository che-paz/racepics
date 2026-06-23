# Go-to-Market — RacePics

> Carta de venta, modelo de negocio y guiones para organizadores.  
> **Audiencia:** Organizadores de carreras que hoy publican fotos en álbumes masivos de Facebook.  
> **Última actualización:** 2025-06-23

---

## Posicionamiento en una frase

**RacePics convierte un álbum de 3.000 fotos en una búsqueda por dorsal: el corredor encuentra solo sus fotos en segundos, sin registrarse y sin hojear Facebook.**

---

## El problema que ya conocen

| Dolor del organizador (Facebook) | Qué pasa en la práctica |
|----------------------------------|-------------------------|
| **Álbum masivo** | 2.000–5.000 fotos en un solo post/álbum |
| **Búsqueda imposible** | El corredor hace scroll infinito o abandona |
| **Soporte manual** | “¿Me pasás la foto del dorsal 1847?” por DM/WhatsApp |
| **Poca percepción de valor** | El corredor no siente un servicio premium del evento |
| **Marca diluida** | Facebook se lleva la atención; el evento es un más en el feed |
| **Sin métricas** | No saben cuántos corredores encontraron su foto |

**Insight de venta:** Facebook es gratis y familiar, pero **el coste oculto es tu tiempo post-carrera + la frustración del corredor + la imagen amateur del evento.**

---

## RacePics vs Facebook

| | **Facebook (status quo)** | **RacePics** |
|---|---------------------------|--------------|
| **Coste** | $0 | Piloto gratis → desde $25/evento |
| **Experiencia corredor** | Scroll en álbum de miles de fotos | Escribe dorsal → ve solo sus fotos en <5 s |
| **Login corredor** | Necesita cuenta FB (o web limitada) | Sin registro, solo link + número |
| **Marca del evento** | Mezclada con notificaciones y ads de Meta | Página dedicada `racepics.app/e/tu-evento` |
| **Carga técnica organizador** | Subir ZIP, esperar, rezar que no falle | Crear evento, invitar fotógrafo, compartir link |
| **Infraestructura** | Servidores de Meta | SaaS (Supabase) — sin servidor propio |
| **Post-carrera** | Horas respondiendo DMs | Link único en redes + cero soporte manual |
| **Profesionalismo** | “Fotos en el grupo de FB” | “Buscá tu dorsal en nuestra galería oficial” |
| **Métricas** | Likes, comentarios vagos | Búsquedas, descargas, % OCR (post-piloto) |

**Mensaje clave:** No competís con “gratis”. Competís con **“¿cuánto te cuesta el caos post-carrera y la mala experiencia del corredor?”**

---

## Argumentos para convencer

### Para el organizador (decisor)

1. **Menos soporte post-evento** — Un link reemplaza cientos de mensajes “¿tenés mi foto?”.
2. **Imagen profesional** — Galería propia con marca del evento, no un álbum más en el feed.
3. **El corredor se siente atendido** — Encuentra su foto en segundos; mejora NPS y recomendación del evento.
4. **Cero infraestructura** — No hosting, no servidor, no IT. SaaS listo.
5. **Coste predecible** — Un pago por evento, no suscripción mensual.
6. **Piloto sin riesgo** — Primer evento gratis; solo pagás si ves valor real.

### Para el corredor (argumento indirecto)

1. Sin cuenta, sin app: link + dorsal.
2. Solo ve *sus* fotos, no miles mezcladas.
3. Descarga y comparte en un clic.

### Para el fotógrafo (influencer interno)

1. Sube en batch (drag & drop); el sistema indexa dorsales solo.
2. No etiqueta manualmente ni renombra archivos.
3. El organizador ve progreso de procesamiento en tiempo real.

---

## Modelo de negocio

### Quién paga

**El organizador**, por evento. Fotógrafo y corredor no pagan en MVP.

### Funnel comercial (D11)

```
Contacto → Demo 15 min → Piloto gratis (Sprint 8) → Caso de éxito → Cobro Stripe (Sprint 9+)
```

### Pricing post-piloto

| Plan | Precio | Para quién | Incluye (propuesta) |
|------|--------|------------|---------------------|
| **Starter** | **$25/evento** | Carreras locales, <500 corredores | Hasta 2.000 fotos · búsqueda por dorsal · watermark · link público |
| **Pro** | **$50/evento** | Medianas, 500–2.000 corredores | Hasta 5.000 fotos · soporte prioritario día-D · métricas básicas |
| **Elite** | **$100/evento** | Grandes eventos, marca premium | Hasta 10.000 fotos · múltiples fotógrafos · white-label ligero (futuro) |

**Ancla de valor:** $25–100 por evento vs. horas de soporte manual + percepción amateur. Un organizador con inscripción de $30–80 × 500 corredores absorbe $50 sin problema si mejora la experiencia post-carrera.

**Regla D11:** No mencionar precio hasta tener caso de éxito del Sprint 8. En piloto: “es gratis, a cambio de feedback y permiso para usar el evento como referencia”.

---

## Qué prometer en el piloto gratis

### ✅ Sí prometer

| Promesa | Detalle |
|---------|---------|
| Evento 100% gratis | Sin tarjeta, sin límite artificial de plan |
| Setup asistido | Ayuda para crear evento, rango de dorsales y onboarding del fotógrafo |
| Búsqueda por dorsal sin login | Link público `racepics.app/e/[slug]` |
| Procesamiento automático | OCR indexa dorsales en background |
| Soporte día-D | Monitoreo activo durante y después de la carrera |
| Watermark del evento | Marca básica en descargas |
| Feedback loop | 15 min post-evento para mejorar el producto |

### ⚠️ Con matices

| Promesa | Matiz honesto |
|---------|---------------|
| “≥85% de fotos indexadas” | Depende de calidad, ángulo del dorsal y luz. Imagen de referencia mejora OCR. |
| “Búsqueda en <5 segundos” | Post-procesamiento; fotos deben estar listas antes de compartir el link. |
| Hasta 2.000 fotos | Límite técnico MVP; avisar si esperan más. |

### ❌ No prometer (fuera de MVP)

- Pagos / venta de fotos al corredor
- Notificaciones automáticas (email/WhatsApp)
- Analytics avanzados de redes
- App móvil · múltiples fotógrafos con créditos · búsqueda por rostro · white-label completo

---

## Objeciones comunes

| Objeción | Respuesta |
|----------|-----------|
| **“Facebook es gratis”** | “Por eso todos tienen el mismo problema: el corredor no encuentra su foto. El primer evento con nosotros es gratis para que lo compruebes.” |
| **“Mis corredores ya están en Facebook”** | “El link se comparte *en* Facebook, Instagram y WhatsApp. Reemplazás el álbum de 3.000 fotos por ‘buscá tu dorsal aquí’.” |
| **“¿Y si el OCR falla?”** | “Configuramos rango de dorsales y foto de referencia. En pruebas ~85%+ de acierto. En el piloto monitoreamos en vivo.” |
| **“No quiero otra plataforma”** | “3 pasos: crear evento (5 min), invitar fotógrafo, compartir link. Nadie se registra.” |
| **“¿Quién paga?”** | “Vos, por evento, cuando decidas seguir después del piloto. Sin mensualidad.” |
| **“¿Dónde quedan las fotos?”** | “Cloud seguro (Supabase). Sin servidor propio.” |
| **“Mi fotógrafo ya tiene su sistema”** | “Él sube en batch como siempre. RacePics agrega búsqueda por dorsal.” |
| **“¿Qué pasa si se cae?”** | “Soporte dedicado día-D en el piloto. Uptime 99%+ en Vercel + Supabase.” |
| **“$50 es caro”** | “¿Cuántas horas respondiendo ‘¿tenés mi foto?’? $50 < 1 hora de tu tiempo. Piloto gratis.” |

---

## Pitch de 30 segundos

> “¿Cuántas veces después de una carrera te escriben corredores pidiendo su foto? Con RacePics subís las fotos una vez, el sistema lee los dorsales automáticamente, y cada corredor entra a un link, pone su número y ve solo sus fotos — sin registrarse, sin scroll infinito en Facebook. Te damos el primer evento gratis. Compartís un link en tus redes en lugar del álbum de 3.000 fotos. ¿Te muestro en 10 minutos cómo funciona?”

---

## Guion de demo (Sprint 8)

**Duración:** 15–20 min. **Pre-requisito:** evento demo con nombre real del organizador.

| Min | Sección | Qué hacer | Qué decir |
|-----|---------|-----------|-----------|
| 0–2 | **Hook** | Pregunta abierta | “Después de tu última carrera, ¿cuántos mensajes recibiste pidiendo fotos? … Eso es lo que resolvemos.” |
| 2–5 | **Vista organizador** | Login → dashboard → evento | “Creás el evento: nombre, fecha, rango de dorsales. En 2 minutos.” |
| 5–7 | **Config OCR** | Rango bib + imagen referencia | “Una foto del dorsal mejora la precisión. Opcional pero recomendado.” |
| 7–9 | **Invitar fotógrafo** | Formulario invitación | “Tu fotógrafo recibe mail, sube en batch. Vos no tocás archivos.” |
| 9–11 | **Upload** | Upload zone con fotos reales | “Procesamiento en segundo plano. Ves cuántas van listas.” |
| 11–13 | **Vista corredor** | `/e/[slug]` en incógnito, buscar dorsal | “Sin login. Dorsal 1847… solo sus fotos. Reemplaza el álbum de Facebook.” |
| 13–15 | **Descarga** | Clic → descargar | “Watermark del evento. Comparte link directo a su foto.” |
| 15–17 | **vs Facebook** | Contraste visual | “FB: 3.000 fotos, scroll, DMs. Acá: link + número.” |
| 17–19 | **Cierre piloto** | Propuesta | “Próximo evento gratis. Te acompañamos día-D. A cambio: feedback y referencia si sale bien.” |
| 19–20 | **Siguiente paso** | Agendar | “¿Cuál es tu próxima carrera? Necesito nombre, fecha, rango dorsales y contacto fotógrafo.” |

### Checklist pre-demo

- [ ] Evento demo con nombre real del organizador
- [ ] 10+ fotos con dorsales procesadas
- [ ] Link `/e/[slug]` en prod
- [ ] Pestaña incógnito para vista corredor
- [ ] Captura álbum FB masivo como contraste (opcional)

---

## Mensajes listos para copiar

### WhatsApp / DM frío

> Hola [nombre], vi que publicaste las fotos de [carrera] en Facebook. ¿Te escribieron mucha gente pidiendo su foto? Estamos probando RacePics: un link donde cada corredor busca su dorsal y ve solo sus fotos, sin registrarse. El primer evento es gratis. ¿Te interesa una demo de 10 min?

### Post del organizador (día de publicación)

> 📸 **Tus fotos de [Carrera X] ya están disponibles**  
> Buscá tu número de dorsal acá → [link]  
> Sin scroll infinito. Sin login. Solo tu número y tus fotos.

### Email post-piloto

> Gracias por confiar en RacePics para [evento]. Resumen: [N] fotos procesadas, [M] corredores buscaron, [K] descargas. ¿Tu próxima carrera? Plan Pro $50/evento — menos de una hora de soporte post-carrera.

---

## Caso de éxito (Sprint 8)

> Completar tras el primer evento real.

| Métrica | Valor |
|---------|-------|
| Evento | |
| Fecha | |
| Fotos subidas | |
| Fotos procesadas | |
| % OCR acierto | |
| Corredores que buscaron | |
| Descargas | |
| Tiempo setup organizador | |
| Tickets soporte post-evento | |
| Testimonio organizador | |

---

## Backlog producto-comercial (en evaluación)

Ideas bajo análisis — ver discusión en sesión de estrategia 2025-06-23:

| Idea | Estado | Notas |
|------|--------|-------|
| Botones compartir a redes por foto | En evaluación | Alto potencial viral; ver límites técnicos IG |
| Watermark RacePics + upsell sin marca | En evaluación | Encaja con tiers Starter/Pro/Elite |

---

## Referencias

- Modelo comercial D11 → [decisiones-arquitectura.md](./decisiones-arquitectura.md)
- Scope MVP → [mvp.md](./mvp.md)
- Sprint 8 piloto → [roadmap.md](./roadmap.md)
