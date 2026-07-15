/**
 * Línea del carrito: un teléfono con una combinación concreta de color y
 * almacenamiento ya elegidos (y su precio ya calculado).
 *
 * No hay control de cantidad en el diseño (ver ADR): el carrito permite
 * líneas duplicadas (mismo teléfono/color/almacenamiento añadido más de una
 * vez), así que cada línea necesita una identidad propia para poder
 * eliminarse individualmente sin afectar a sus duplicados — `id`, generado
 * aquí si no se pasa uno explícito. Al reconstruir un `CartItem` desde
 * `localStorage` sí se pasa el `id` ya persistido, para que no cambie en
 * cada lectura.
 */
export class CartItem {
  /**
   * @param {Object} params
   * @param {string} [params.id]
   * @param {string} params.phoneId
   * @param {string} params.name
   * @param {string} params.imageUrl
   * @param {string} params.color
   * @param {string} params.storage
   * @param {number} params.price
   */
  constructor({ id = createId(), phoneId, name, imageUrl, color, storage, price }) {
    this.id = id;
    this.phoneId = phoneId;
    this.name = name;
    this.imageUrl = imageUrl;
    this.color = color;
    this.storage = storage;
    this.price = price;
  }
}

/**
 * Identificador pseudo-único: suficiente para una lista de carrito local
 * (no hay riesgo real de colisión a esta escala). No usa `crypto.randomUUID()`
 * para no atar el dominio a una API que no está garantizada por igual en
 * todos los entornos JS donde puede correr este código.
 * @returns {string}
 */
function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
