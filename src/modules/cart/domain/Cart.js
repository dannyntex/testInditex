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
   * Añade una línea. Si ya existe una línea con el mismo teléfono, color y
   * almacenamiento, la sustituye en vez de duplicarla (un carrito no tiene
   * dos líneas idénticas).
   * @param {import('./CartItem').CartItem} item
   * @returns {Cart}
   */
  addItem(item) {
    const withoutSameVariant = this.items.filter((existing) => !existing.isSameVariant(item));
    return new Cart([...withoutSameVariant, item]);
  }

  /**
   * Elimina la línea que coincide en teléfono, color y almacenamiento.
   * @param {import('./CartItem').CartItem} item
   * @returns {Cart}
   */
  removeItem(item) {
    return new Cart(this.items.filter((existing) => !existing.isSameVariant(item)));
  }

  /**
   * @returns {number} suma del precio de todas las líneas.
   */
  total() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
