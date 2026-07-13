/**
 * Caso de uso: eliminar una línea del carrito.
 * @param {import('../../domain/CartRepository').CartRepository} cartRepository
 */
export function createRemoveFromCart(cartRepository) {
  return {
    /**
     * @param {import('../../domain/CartItem').CartItem} item
     * @returns {Promise<import('../../domain/Cart').Cart>}
     */
    execute: async (item) => {
      const cart = await cartRepository.get();
      const updatedCart = cart.removeItem(item);
      await cartRepository.save(updatedCart);
      return updatedCart;
    },
  };
}
