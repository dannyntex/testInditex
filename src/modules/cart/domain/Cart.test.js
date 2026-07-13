import { Cart } from './Cart';
import { CartItem } from './CartItem';

const item = (overrides = {}) =>
  new CartItem({
    phoneId: 'SMG-S24U',
    name: 'Galaxy S24 Ultra',
    imageUrl: 'https://example.com/s24u.webp',
    color: 'Titanium Black',
    storage: '256 GB',
    price: 1229,
    ...overrides,
  });

describe('Cart', () => {
  it('starts empty with total 0', () => {
    const cart = new Cart();

    expect(cart.items).toEqual([]);
    expect(cart.total()).toBe(0);
  });

  it('adds an item as a new line', () => {
    const cart = new Cart().addItem(item());

    expect(cart.items).toHaveLength(1);
    expect(cart.total()).toBe(1229);
  });

  it('sums the price of every line for the total', () => {
    const cart = new Cart()
      .addItem(item({ price: 1229 }))
      .addItem(item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB', price: 459 }));

    expect(cart.total()).toBe(1688);
  });

  it('replaces the line when the same phone/color/storage is added again', () => {
    const cart = new Cart().addItem(item({ price: 1229 })).addItem(item({ price: 1229 })); // misma variante, se re-añade

    expect(cart.items).toHaveLength(1);
    expect(cart.total()).toBe(1229);
  });

  it('does not duplicate a line for the same phone with a different variant', () => {
    const cart = new Cart()
      .addItem(item({ storage: '256 GB', price: 1229 }))
      .addItem(item({ storage: '512 GB', price: 1329 }));

    expect(cart.items).toHaveLength(2);
    expect(cart.total()).toBe(2558);
  });

  it('removes the line matching phone/color/storage', () => {
    const first = item({ price: 1229 });
    const second = item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB', price: 459 });
    const cart = new Cart().addItem(first).addItem(second).removeItem(first);

    expect(cart.items).toEqual([second]);
    expect(cart.total()).toBe(459);
  });

  it('is immutable: addItem/removeItem return a new Cart without mutating the original', () => {
    const original = new Cart();
    const withItem = original.addItem(item());

    expect(original.items).toHaveLength(0);
    expect(withItem.items).toHaveLength(1);
  });
});
