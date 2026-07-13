/**
 * Línea del carrito: un teléfono con una combinación concreta de color y
 * almacenamiento ya elegidos (y su precio ya calculado).
 */
export class CartItem {
  /**
   * @param {Object} params
   * @param {string} params.phoneId
   * @param {string} params.name
   * @param {string} params.imageUrl
   * @param {string} params.color
   * @param {string} params.storage
   * @param {number} params.price
   */
  constructor({ phoneId, name, imageUrl, color, storage, price }) {
    this.phoneId = phoneId;
    this.name = name;
    this.imageUrl = imageUrl;
    this.color = color;
    this.storage = storage;
    this.price = price;
  }

  /**
   * Dos líneas son la misma variante si son el mismo teléfono con el mismo
   * color y el mismo almacenamiento. Es la identidad que usa `Cart` para
   * añadir/eliminar sin necesitar un id de línea aparte.
   * @param {CartItem} other
   * @returns {boolean}
   */
  isSameVariant(other) {
    return (
      this.phoneId === other.phoneId && this.color === other.color && this.storage === other.storage
    );
  }
}
