import { Cart } from '../../domain/Cart';

/**
 * Fake in-memory del puerto `CartRepository`, para tests de casos de uso.
 * No es un mock de métodos sueltos: implementa el contrato real del puerto.
 * @implements {import('../../domain/CartRepository').CartRepository}
 */
export class InMemoryCartRepository {
  /**
   * @param {Cart} [initialCart]
   */
  constructor(initialCart = new Cart()) {
    this.cart = initialCart;
  }

  async get() {
    return this.cart;
  }

  async save(cart) {
    this.cart = cart;
  }
}
