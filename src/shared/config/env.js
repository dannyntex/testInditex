/**
 * Lectura centralizada de variables de entorno (solo servidor: aquí y solo
 * aquí puede vivir `process.env` fuera de scripts de arranque). Nunca se
 * hardcodea la API key ni la URL base en el código de infraestructura.
 *
 * La lectura es perezosa (se evalúa al llamar la función, no al importar el
 * módulo) para que importar este fichero no falle en tests que no necesitan
 * la config real.
 */

const DEFAULT_PHONES_API_BASE_URL = 'https://prueba-tecnica-api-tienda-moviles.onrender.com';

/**
 * @typedef {Object} ServerConfig
 * @property {string} phonesApiBaseUrl
 * @property {string} phonesApiKey
 */

/**
 * @returns {ServerConfig}
 * @throws {Error} si falta `PHONES_API_KEY`.
 */
export function getServerConfig() {
  const phonesApiKey = process.env.PHONES_API_KEY;
  if (!phonesApiKey) {
    throw new Error(
      'Falta la variable de entorno PHONES_API_KEY (ver .env.example). Nunca se hardcodea.',
    );
  }

  return {
    phonesApiBaseUrl: process.env.PHONES_API_BASE_URL || DEFAULT_PHONES_API_BASE_URL,
    phonesApiKey,
  };
}
