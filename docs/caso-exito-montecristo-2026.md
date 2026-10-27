# Caso de éxito — Trail Run Montecristo 2026 (EsquiTrail)

> Datos reales de producción, extraídos el 2026-10-27 antes de archivar el evento y borrar las fotos.  
> Horas en hora de Guatemala (UTC-6).

## Resumen

| Métrica | Valor |
|---------|-------|
| Fecha del evento | Domingo 27 de septiembre 2026 · Parque Chatún, Esquipulas |
| Inscritos | ~265 corredores |
| Fotos subidas | **3.603** (3.564 procesadas · 39 subidas incompletas) |
| Fotos con dorsal detectado por OCR | **2.459 (69%)** |
| Dorsales del 1–300 con al menos una foto | **265** |
| Fotos por dorsal | mediana **11** · máximo 113 |
| Búsquedas de corredores | **1.641** |
| Personas distintas que buscaron (navegadores) | **619** |
| Dorsales distintos buscados | **249** — 235 encontraron fotos, 14 no |
| Costo para el corredor | Gratis |

## Línea de tiempo

| Momento | Hora |
|---------|------|
| Primera foto subida | 27 sep · 17:01 (mismo día del evento) |
| Primera búsqueda de un corredor | 27 sep · 19:20 |
| Última foto subida | 28 sep · 18:39 |
| Todas las fotos procesadas | 28 sep · 18:59 |
| Pico de tráfico | 28 sep · 18:00–19:00 → **512 búsquedas en una hora** |

## Búsquedas por día

| Día | Búsquedas |
|-----|-----------|
| 27 sep (día del evento) | 27 |
| 28 sep | 1.018 |
| 29 sep | 318 |
| 30 sep | 59 |
| 1–5 oct | 151 |
| 6–26 oct | 68 |

El 83% de las búsquedas ocurrió entre el día del evento y los dos días siguientes (27–29 sep).

## Dorsales más buscados

| Dorsal | Búsquedas |
|--------|-----------|
| 235 | 485 |
| 1 | 35 |
| 281 | 32 |
| 181 | 20 |
| 61 | 17 |

El dorsal 235 concentra visitas de un enlace compartido en redes: cada apertura de un enlace a una foto cuenta como búsqueda.

## Notas sobre los datos

- **Descargas y compartidos no se midieron**: la app no los registraba en este evento.
- Las búsquedas bloqueadas por el límite anti-abuso (5 dorsales distintos por hora) no se cuentan.
- "Personas distintas" = navegadores distintos; una misma persona en celular y computadora cuenta dos veces.
- 273 de los 619 visitantes hicieron una sola búsqueda (encontraron su dorsal y listo).

## Aprendizajes para el próximo evento

1. **OCR 69% vs objetivo 85%**: casi un tercio de las fotos no tiene dorsal legible (tapado, de lado, lejos). Evaluar imagen de referencia del dorsal y reconocimiento facial post-piloto.
2. **Facturación de Google Cloud desactivada el día del evento** retrasó el procesamiento. Verificar facturación de `racepics-dev` antes de cada evento.
3. **Fotos en tamaño completo** (mediana 5,8 MB, hasta 21 MB): el fotógrafo debe exportar a ~2048 px. La galería necesita miniaturas.
4. **Medir descargas y compartidos** desde el inicio para el caso de éxito.
5. Supabase en plan Free no alcanza para un evento real (1 GB): activar Pro solo durante la ventana del evento.
