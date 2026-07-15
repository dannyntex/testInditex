/**
 * Lectura centralizada de variables de entorno (solo servidor: aquí y solo
 * aquí puede vivir `process.env` fuera de scripts de arranque). Ni la API
 * key ni la URL base tienen ningún valor por defecto hardcodeado en el
 * código: las dos son obligatorias y revientan explícitamente si faltan
 * (necesario para desplegar, p.ej. en Render, sin depender de que nadie
 * recuerde rellenar un valor "opcional" — ver .env.example).
 *
 * La lectura es perezosa (se evalúa al llamar la función, no al importar el
 * módulo) para que importar este fichero no falle en tests que no necesitan
 * la config real.
 */

/**
 * @typedef {Object} ServerConfig
 * @property {string} phonesApiBaseUrl
 * @property {string} phonesApiKey
 */

/**
 * @returns {ServerConfig}
 * @throws {Error} si falta `PHONES_API_KEY` o `PHONES_API_BASE_URL`.
 */
export function getServerConfig() {
  const phonesApiKey = process.env.PHONES_API_KEY;
  if (!phonesApiKey) {
    throw new Error(
      'Falta la variable de entorno PHONES_API_KEY (ver .env.example). Nunca se hardcodea.',
    );
  }

  const phonesApiBaseUrl = process.env.PHONES_API_BASE_URL;
  if (!phonesApiBaseUrl) {
    throw new Error(
      'Falta la variable de entorno PHONES_API_BASE_URL (ver .env.example). Nunca se hardcodea.',
    );
  }

  return { phonesApiBaseUrl, phonesApiKey };
}
