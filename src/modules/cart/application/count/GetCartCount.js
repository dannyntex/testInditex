/**
 * Caso de uso: obtener el número de líneas del carrito (para el badge de la navbar).
 * @param {import('../../domain/CartRepository').CartRepository} cartRepository
 */
export function createGetCartCount(cartRepository) {
  return {
    /**
     * @returns {Promise<number>}
     */
    execute: async () => {
      const cart = await cartRepository.get();
      return cart.items.length;
    },
  };
}
