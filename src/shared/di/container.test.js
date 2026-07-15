/** @jest-environment node */
import { createClientContainer, createServerContainer } from './container';

describe('createServerContainer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PHONES_API_KEY: 'test-key',
      PHONES_API_BASE_URL: 'https://api.example.test',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('wires the phones use cases backed by ApiPhoneRepository', () => {
    const container = createServerContainer();

    expect(typeof container.getAllPhones.execute).toBe('function');
    expect(typeof container.searchPhones.execute).toBe('function');
    expect(typeof container.getPhoneDetail.execute).toBe('function');
  });

  it('throws when the required server config is missing', () => {
    delete process.env.PHONES_API_KEY;

    expect(() => createServerContainer()).toThrow('PHONES_API_KEY');
  });

  it('throws when PHONES_API_BASE_URL is missing (no hardcoded fallback)', () => {
    delete process.env.PHONES_API_BASE_URL;

    expect(() => createServerContainer()).toThrow('PHONES_API_BASE_URL');
  });
});

describe('createClientContainer', () => {
  it('wires the phones use cases backed by HttpPhoneRepository', () => {
    const container = createClientContainer();

    expect(typeof container.getAllPhones.execute).toBe('function');
    expect(typeof container.searchPhones.execute).toBe('function');
    expect(typeof container.getPhoneDetail.execute).toBe('function');
  });

  it('wires the cart use cases backed by LocalStorageCartRepository', () => {
    const container = createClientContainer();

    expect(typeof container.getCart.execute).toBe('function');
    expect(typeof container.addToCart.execute).toBe('function');
    expect(typeof container.removeFromCart.execute).toBe('function');
    expect(typeof container.getCartCount.execute).toBe('function');
  });
});
