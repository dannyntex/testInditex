/**
 * Puerto: contrato de persistencia del carrito. El adaptador por defecto
 * (`LocalStorageCartRepository`, hito 3) vive detrás de este contrato.
 *
 * @typedef {Object} CartRepository
 * @property {GetCartFn} get
 * @property {SaveCartFn} save
 */

/**
 * @callback GetCartFn
 * @returns {Promise<import('./Cart').Cart>}
 */

/**
 * @callback SaveCartFn
 * @param {import('./Cart').Cart} cart
 * @returns {Promise<void>}
 */

export {};
