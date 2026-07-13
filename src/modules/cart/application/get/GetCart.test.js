import { Cart } from '../../domain/Cart';
import { CartItem } from '../../domain/CartItem';
import { InMemoryCartRepository } from '../__fakes__/InMemoryCartRepository';
import { createGetCart } from './GetCart';

describe('GetCart', () => {
  it('returns the cart currently stored in the repository', async () => {
    const item = new CartItem({
      phoneId: 'SMG-S24U',
      name: 'Galaxy S24 Ultra',
      imageUrl: 'a',
      color: 'Titanium Black',
      storage: '256 GB',
      price: 1229,
    });
    const cartRepository = new InMemoryCartRepository(new Cart([item]));
    const getCart = createGetCart(cartRepository);

    const result = await getCart.execute();

    expect(result.items).toEqual([item]);
  });

  it('returns an empty cart when there is nothing stored yet', async () => {
    const getCart = createGetCart(new InMemoryCartRepository());

    const result = await getCart.execute();

    expect(result.items).toEqual([]);
  });
});
