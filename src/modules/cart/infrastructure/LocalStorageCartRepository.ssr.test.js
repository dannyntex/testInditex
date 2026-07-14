/**
 * @jest-environment node
 *
 * Entorno node real (no jsdom): aquí `window` no existe en absoluto, a
 * diferencia de simular su ausencia en jsdom borrando `global.window` (que
 * no hace que `typeof window === 'undefined'` sea cierto, porque en el
 * entorno jsdom `window` es el propio objeto global).
 */
import { Cart } from '../domain/Cart';
import { CartItem } from '../domain/CartItem';
import { LocalStorageCartRepository } from './LocalStorageCartRepository';

describe('LocalStorageCartRepository (SSR, sin window)', () => {
  it('typeof window is undefined in this environment (sanity check)', () => {
    expect(typeof window).toBe('undefined');
  });

  it('get() returns an empty cart without touching localStorage', async () => {
    const cart = await new LocalStorageCartRepository().get();

    expect(cart).toBeInstanceOf(Cart);
    expect(cart.items).toEqual([]);
  });

  it('save() is a no-op and does not throw', async () => {
    const item = new CartItem({
      phoneId: 'SMG-S24U',
      name: 'Galaxy S24 Ultra',
      imageUrl: 'a',
      color: 'Titanium Black',
      storage: '256 GB',
      price: 1229,
    });

    await expect(new LocalStorageCartRepository().save(new Cart([item]))).resolves.toBeUndefined();
  });
});
