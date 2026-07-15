import { Cart } from '../domain/Cart';
import { CartItem } from '../domain/CartItem';
import { LocalStorageCartRepository } from './LocalStorageCartRepository';

const item = (overrides = {}) =>
  new CartItem({
    phoneId: 'SMG-S24U',
    name: 'Galaxy S24 Ultra',
    imageUrl: 'a',
    color: 'Titanium Black',
    storage: '256 GB',
    price: 1229,
    ...overrides,
  });

describe('LocalStorageCartRepository (browser)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty cart when nothing is stored yet', async () => {
    const cart = await new LocalStorageCartRepository().get();

    expect(cart).toBeInstanceOf(Cart);
    expect(cart.items).toEqual([]);
  });

  it('round-trips a cart through save/get, reconstructing CartItem instances (id included)', async () => {
    const repository = new LocalStorageCartRepository();
    const original = item();

    await repository.save(new Cart([original]));
    const restored = await repository.get();

    expect(restored.items).toEqual([original]);
    expect(restored.items[0]).toBeInstanceOf(CartItem);
    expect(restored.items[0].id).toBe(original.id);
    expect(restored.total()).toBe(1229);
  });

  it('preserves each duplicate line as a distinct id through save/get', async () => {
    const repository = new LocalStorageCartRepository();
    const first = item();
    const duplicate = item();

    await repository.save(new Cart([first, duplicate]));
    const restored = await repository.get();

    expect(restored.items.map((restoredItem) => restoredItem.id)).toEqual([first.id, duplicate.id]);
  });

  it('persists under its own storage key, not raw at the top level', async () => {
    await new LocalStorageCartRepository().save(new Cart([item()]));

    expect(window.localStorage.getItem('zara-challenge:cart')).not.toBeNull();
  });

  it('returns an empty cart when the stored value is corrupted JSON', async () => {
    window.localStorage.setItem('zara-challenge:cart', '{not-json');

    const cart = await new LocalStorageCartRepository().get();

    expect(cart.items).toEqual([]);
  });

  it('returns an empty cart when the stored JSON has no items field', async () => {
    window.localStorage.setItem('zara-challenge:cart', '{}');

    const cart = await new LocalStorageCartRepository().get();

    expect(cart.items).toEqual([]);
  });
});
