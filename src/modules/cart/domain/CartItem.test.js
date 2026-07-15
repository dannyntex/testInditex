import { CartItem } from './CartItem';

const params = {
  phoneId: 'SMG-S24U',
  name: 'Galaxy S24 Ultra',
  imageUrl: 'https://example.com/s24u.webp',
  color: 'Titanium Black',
  storage: '256 GB',
  price: 1229,
};

describe('CartItem', () => {
  it('auto-generates an id when none is provided', () => {
    const item = new CartItem(params);

    expect(typeof item.id).toBe('string');
    expect(item.id.length).toBeGreaterThan(0);
  });

  it('generates a different id for each instance, even with identical fields (duplicates are allowed lines)', () => {
    const first = new CartItem(params);
    const second = new CartItem(params);

    expect(first.id).not.toBe(second.id);
  });

  it('preserves an explicit id instead of generating a new one (needed to round-trip from storage)', () => {
    const item = new CartItem({ ...params, id: 'stored-id-123' });

    expect(item.id).toBe('stored-id-123');
  });
});
