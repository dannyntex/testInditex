import { Cart } from '../../domain/Cart';
import { CartItem } from '../../domain/CartItem';
import { InMemoryCartRepository } from '../__fakes__/InMemoryCartRepository';
import { createGetCartCount } from './GetCartCount';

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

describe('GetCartCount', () => {
  it('returns 0 for an empty cart', async () => {
    const getCartCount = createGetCartCount(new InMemoryCartRepository());

    expect(await getCartCount.execute()).toBe(0);
  });

  it('returns the number of lines in the cart', async () => {
    const cart = new Cart([
      item(),
      item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB' }),
    ]);
    const getCartCount = createGetCartCount(new InMemoryCartRepository(cart));

    expect(await getCartCount.execute()).toBe(2);
  });
});
