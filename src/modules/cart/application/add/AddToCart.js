/**
 * Caso de uso: añadir una línea al carrito (color y almacenamiento ya elegidos).
 * @param {import('../../domain/CartRepository').CartRepository} cartRepository
 */
export function createAddToCart(cartRepository) {
  return {
    /**
     * @param {import('../../domain/CartItem').CartItem} item
     * @returns {Promise<import('../../domain/Cart').Cart>}
     */
    execute: async (item) => {
      const cart = await cartRepository.get();
      const updatedCart = cart.addItem(item);
      await cartRepository.save(updatedCart);
      return updatedCart;
    },
  };
}
