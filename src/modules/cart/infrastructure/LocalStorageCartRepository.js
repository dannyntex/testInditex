import { Cart } from '../domain/Cart';
import { CartItem } from '../domain/CartItem';

const STORAGE_KEY = 'zara-challenge:cart';

/**
 * Adaptador por defecto (cliente): implementa `CartRepository` con
 * `localStorage`. Guardado contra SSR: en servidor no existe `window`, así
 * que `get` devuelve un carrito vacío y `save` no hace nada (el carrito de
 * servidor siempre va vacío en el primer render; se hidrata en cliente).
 * @implements {import('../domain/CartRepository').CartRepository}
 */
export class LocalStorageCartRepository {
  async get() {
    if (typeof window === 'undefined') {
      return new Cart();
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Cart();
    }

    try {
      const parsed = JSON.parse(raw);
      const items = (parsed.items ?? []).map((item) => new CartItem(item));
      return new Cart(items);
    } catch {
      return new Cart();
    }
  }

  /**
   * @param {Cart} cart
   */
  async save(cart) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }
}
