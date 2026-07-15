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
  it('removes the given line and persists the updated cart', async () => {
    const target = item();
    const other = item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB', price: 459 });
    const cartRepository = new InMemoryCartRepository(new Cart([target, other]));
    const removeFromCart = createRemoveFromCart(cartRepository);

    const updatedCart = await removeFromCart.execute(target);

    expect(updatedCart.items).toEqual([other]);
    expect((await cartRepository.get()).items).toEqual([other]);
  });

  it('removes only the exact line, leaving an identical duplicate untouched', async () => {
    const target = item();
    const duplicate = item();
    const cartRepository = new InMemoryCartRepository(new Cart([target, duplicate]));
    const removeFromCart = createRemoveFromCart(cartRepository);

    const updatedCart = await removeFromCart.execute(target);

    expect(updatedCart.items).toEqual([duplicate]);
  });

  it('is a no-op when the exact line id is not in the cart', async () => {
    const cartRepository = new InMemoryCartRepository(new Cart([item()]));
    const removeFromCart = createRemoveFromCart(cartRepository);

    const updatedCart = await removeFromCart.execute(
      item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB' }),
    );

    expect(updatedCart.items).toHaveLength(1);
  });
});
