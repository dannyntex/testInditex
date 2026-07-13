/**
 * @typedef {Object} PhoneSpecs
 * @property {string} screen
 * @property {string} resolution
 * @property {string} processor
 * @property {string} mainCamera
 * @property {string} selfieCamera
 * @property {string} battery
 * @property {string} os
 * @property {string} screenRefreshRate
 */

/**
 * @typedef {Object} ColorOption
 * @property {string} name
 * @property {string} hexCode
 * @property {string} imageUrl
 */

/**
 * @typedef {Object} StorageOption
 * @property {string} capacity
 * @property {number} priceDelta - Diferencia respecto a `basePrice` (no el precio
 *   absoluto que devuelve la API; ver decisión documentada en Price.js).
 */

/**
 * Entidad de detalle: todo lo que necesita la vista Detalle.
 */
export class PhoneDetail {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.brand
   * @param {string} params.name
   * @param {number} params.basePrice
   * @param {string} params.imageUrl
   * @param {string} params.description
   * @param {number} [params.rating]
   * @param {PhoneSpecs} params.specs
   * @param {ColorOption[]} params.colorOptions
   * @param {StorageOption[]} params.storageOptions
   * @param {import('./Phone').Phone[]} params.similarProducts
   */
  constructor({
    id,
    brand,
    name,
    basePrice,
    imageUrl,
    description,
    rating,
    specs,
    colorOptions,
    storageOptions,
    similarProducts,
  }) {
    this.id = id;
    this.brand = brand;
    this.name = name;
    this.basePrice = basePrice;
    this.imageUrl = imageUrl;
    this.description = description;
    this.rating = rating;
    this.specs = specs;
    this.colorOptions = colorOptions;
    this.storageOptions = storageOptions;
    this.similarProducts = similarProducts;
  }
}
