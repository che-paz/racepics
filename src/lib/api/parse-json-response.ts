/**
 * Parse JSON from a fetch Response; handles empty bodies (e.g. 500 without body).
 */
export async function parseJsonResponse<T>(
  response: Response
): Promise<T & { error?: string }> {
  const text = await response.text();
  if (!text) {
    return {
      error: response.ok
        ? undefined
        : `Error del servidor (${response.status}). ¿Está corriendo npm run inngest:dev?`,
    } as T & { error?: string };
  }

  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    return {
      error: `Respuesta inválida del servidor (${response.status}).`,
    } as T & { error?: string };
  }
}
