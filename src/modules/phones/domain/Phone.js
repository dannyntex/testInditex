/**
 * Entidad de listado: la tarjeta de un teléfono en el grid.
 * Coincide 1:1 con lo que necesita la vista Listado; no lleva specs ni opciones.
 */
export class Phone {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.brand
   * @param {string} params.name
   * @param {number} params.basePrice
   * @param {string} params.imageUrl
   */
  constructor({ id, brand, name, basePrice, imageUrl }) {
    this.id = id;
    this.brand = brand;
    this.name = name;
    this.basePrice = basePrice;
    this.imageUrl = imageUrl;
  }
}
