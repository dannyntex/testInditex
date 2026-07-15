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
    const newItem = item();

    const updatedCart = await addToCart.execute(newItem);

    expect(updatedCart.items).toEqual([newItem]);
    expect((await cartRepository.get()).items).toEqual([newItem]);
  });

  it('adds a new line even for the same phone/color/storage already in the cart (no quantity control: duplicates allowed)', async () => {
    const cartRepository = new InMemoryCartRepository();
    const addToCart = createAddToCart(cartRepository);
    await addToCart.execute(item({ price: 1229 }));

    const updatedCart = await addToCart.execute(item({ price: 1229 }));

    expect(updatedCart.items).toHaveLength(2);
  });
});
