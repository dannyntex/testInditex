import { CartItem } from '../../domain/CartItem';
import { InMemoryCartRepository } from '../__fakes__/InMemoryCartRepository';
import { createAddToCart } from './AddToCart';

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

describe('AddToCart', () => {
  it('adds the item and persists the updated cart', async () => {
    const cartRepository = new InMemoryCartRepository();
    const addToCart = createAddToCart(cartRepository);

    const updatedCart = await addToCart.execute(item());

    expect(updatedCart.items).toEqual([item()]);
    expect((await cartRepository.get()).items).toEqual([item()]);
  });

  it('replaces an existing line for the same phone/color/storage', async () => {
    const cartRepository = new InMemoryCartRepository();
    const addToCart = createAddToCart(cartRepository);
    await addToCart.execute(item({ price: 1229 }));

    const updatedCart = await addToCart.execute(item({ price: 1229 }));

    expect(updatedCart.items).toHaveLength(1);
  });
});
