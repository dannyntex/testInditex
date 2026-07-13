/**
 * Caso de uso: obtener el carrito actual.
 * @param {import('../../domain/CartRepository').CartRepository} cartRepository
 */
export function createGetCart(cartRepository) {
  return {
    /**
     * @returns {Promise<import('../../domain/Cart').Cart>}
     */
    execute: () => cartRepository.get(),
  };
}
