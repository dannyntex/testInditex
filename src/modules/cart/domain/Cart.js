/**
 * Carrito de la compra. Inmutable: `addItem`/`removeItem` devuelven un `Cart`
 * nuevo en lugar de mutar el actual.
 */
export class Cart {
  /**
   * @param {import('./CartItem').CartItem[]} [items]
   */
  constructor(items = []) {
    this.items = items;
  }

  /**
   * Añade una línea nueva. No hay control de cantidad en el diseño: añadir
   * la misma variante (teléfono+color+almacenamiento) más de una vez crea
   * líneas duplicadas a propósito, en vez de fusionarlas en silencio (eso
   * parecería un fallo: el usuario pulsa "añadir" y no ve ningún cambio).
   * @param {import('./CartItem').CartItem} item
   * @returns {Cart}
   */
  addItem(item) {
    return new Cart([...this.items, item]);
  }

  /**
   * Elimina la línea con ese `id` exacto. No compara por teléfono/color/
   * almacenamiento: puede haber varias líneas idénticas (duplicados
   * permitidos) y solo debe desaparecer la que se pasó, no sus duplicados.
   * @param {import('./CartItem').CartItem} item
   * @returns {Cart}
   */
  removeItem(item) {
    return new Cart(this.items.filter((existing) => existing.id !== item.id));
  }

  /**
   * @returns {number} suma del precio de todas las líneas.
   */
  total() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
