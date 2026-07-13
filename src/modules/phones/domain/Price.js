/**
 * Value object: precio final de un teléfono para una combinación de
 * almacenamiento y color elegidos.
 *
 * Decisión de modelado (verificada contra la API real, ver hito 2): la API
 * expresa el precio de cada opción de almacenamiento como un precio absoluto
 * (p.ej. 256GB=1229, 512GB=1329, 1TB=1529) y las opciones de color no llevan
 * ningún precio asociado. El dominio no copia esa forma: normaliza el
 * almacenamiento a una `priceDelta` (absoluto - basePrice) y deja el delta de
 * color como parámetro explícito de `Price`, en 0 mientras la API no ofrezca
 * variación de precio por color. Así el cálculo es siempre
 * `basePrice + storageDelta + colorDelta`, y si en el futuro el color sí
 * afecta al precio, no hay que tocar esta clase.
 */
export class Price {
  /**
   * @param {number} basePrice
   * @param {number} [storageDelta]
   * @param {number} [colorDelta]
   */
  constructor(basePrice, storageDelta = 0, colorDelta = 0) {
    this.basePrice = basePrice;
    this.storageDelta = storageDelta;
    this.colorDelta = colorDelta;
  }

  /**
   * @returns {number} precio final = base + variación de almacenamiento + variación de color.
   */
  final() {
    return this.basePrice + this.storageDelta + this.colorDelta;
  }
}
