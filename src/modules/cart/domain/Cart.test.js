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

  it('keeps both lines when the same phone/color/storage is added twice: no quantity control in the design, duplicates are intentional', () => {
    const cart = new Cart().addItem(item({ price: 1229 })).addItem(item({ price: 1229 }));

    expect(cart.items).toHaveLength(2);
    expect(cart.total()).toBe(2458);
  });

  it('does not merge a different variant of the same phone into one line', () => {
    const cart = new Cart()
      .addItem(item({ storage: '256 GB', price: 1229 }))
      .addItem(item({ storage: '512 GB', price: 1329 }));

    expect(cart.items).toHaveLength(2);
    expect(cart.total()).toBe(2558);
  });

  it('removes only the line with that exact id, leaving every other line untouched (including an identical duplicate)', () => {
    const first = item({ price: 1229 });
    const duplicate = item({ price: 1229 });
    const other = item({ phoneId: 'GPX-8A', color: 'Obsidiana', storage: '128 GB', price: 459 });
    const cart = new Cart().addItem(first).addItem(duplicate).addItem(other).removeItem(first);

    expect(cart.items).toEqual([duplicate, other]);
    expect(cart.total()).toBe(1688);
  });

  it('is immutable: addItem/removeItem return a new Cart without mutating the original', () => {
    const original = new Cart();
    const withItem = original.addItem(item());

    expect(original.items).toHaveLength(0);
    expect(withItem.items).toHaveLength(1);
  });
});
