import { Cart } from '../../domain/Cart';
import { CartItem } from '../../domain/CartItem';
import { InMemoryCartRepository } from '../__fakes__/InMemoryCartRepository';
import { createRemoveFromCart } from './RemoveFromCart';

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

describe('RemoveFromCart', () => {
  it('removes the matching line and persists the updated cart', async () => {
    const other = item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB', price: 459 });
    const cartRepository = new InMemoryCartRepository(new Cart([item(), other]));
    const removeFromCart = createRemoveFromCart(cartRepository);

    const updatedCart = await removeFromCart.execute(item());

    expect(updatedCart.items).toEqual([other]);
    expect((await cartRepository.get()).items).toEqual([other]);
  });

  it('is a no-op when the item is not in the cart', async () => {
    const cartRepository = new InMemoryCartRepository(new Cart([item()]));
    const removeFromCart = createRemoveFromCart(cartRepository);

    const updatedCart = await removeFromCart.execute(
      item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB' }),
    );

    expect(updatedCart.items).toEqual([item()]);
  });
});
