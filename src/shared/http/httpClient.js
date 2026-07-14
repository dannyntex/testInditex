/**
 * Cliente HTTP compartido: envuelve `fetch` (nativo en Node 18 y en el
 * navegador) para centralizar la construcción de URL+query, el parseo JSON y
 * el mapeo de respuestas no-OK a un error homogéneo.
 */

/**
 * Error de una llamada HTTP no-OK. Lleva el status para que quien llame
 * (p.ej. las rutas BFF) pueda mapearlo al código HTTP adecuado.
 */
export class HttpError extends Error {
  /**
   * @param {number} status
   * @param {unknown} body - cuerpo de la respuesta ya parseado (JSON) si fue posible.
   */
  constructor(status, body) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Construye la URL a mano (en vez de con `new URL(path, base)`) porque en
 * cliente `baseUrl` está vacío y `path` es relativo (p.ej. `/api/phones`):
 * `URL` exige una base absoluta para resolver una ruta relativa, y `fetch` sí
 * sabe resolverla sola contra el origen de la página.
 * @param {string} baseUrl
 * @param {string} path
 * @param {Record<string, string | number | undefined>} [query]
 * @returns {string}
 */
function buildUrl(baseUrl, path, query = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const base = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  const fullPath = `${base}${path}`;
  const queryString = searchParams.toString();
  return queryString ? `${fullPath}?${queryString}` : fullPath;
}

/**
 * @param {Object} params
 * @param {string} [params.baseUrl] - Si se omite, `path` debe ser una URL absoluta o relativa válida en el entorno actual.
 * @param {string} params.path
 * @param {Record<string, string | number | undefined>} [params.query]
 * @param {Record<string, string>} [params.headers]
 * @returns {Promise<unknown>} el cuerpo ya parseado como JSON.
 * @throws {HttpError} si la respuesta no es OK.
 */
export async function getJson({ baseUrl, path, query, headers }) {
  const url = buildUrl(baseUrl, path, query);
  const response = await fetch(url, { headers });
  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new HttpError(response.status, body);
  }

  return body;
}
