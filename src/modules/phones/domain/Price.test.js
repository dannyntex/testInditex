import { Price } from './Price';

describe('Price', () => {
  it('equals basePrice when there is no storage nor color delta', () => {
    const price = new Price(1329);

    expect(price.final()).toBe(1329);
  });

  it('adds the storage delta to the base price', () => {
    const price = new Price(1329, -100);

    expect(price.final()).toBe(1229);
  });

  it('adds the color delta to the base price', () => {
    const price = new Price(1329, 0, 20);

    expect(price.final()).toBe(1349);
  });

  it('adds both storage and color deltas to the base price', () => {
    const price = new Price(1329, 200, 20);

    expect(price.final()).toBe(1549);
  });

  it('supports negative final combinations without clamping (domain does not decide business floors)', () => {
    const price = new Price(100, -150);

    expect(price.final()).toBe(-50);
  });
});
