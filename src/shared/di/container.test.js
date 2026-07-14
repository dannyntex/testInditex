/** @jest-environment node */
import { createClientContainer, createServerContainer } from './container';

describe('createServerContainer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, PHONES_API_KEY: 'test-key' };
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
});

describe('createClientContainer', () => {
  it('wires the phones use cases backed by HttpPhoneRepository', () => {
    const container = createClientContainer();

    expect(typeof container.getAllPhones.execute).toBe('function');
    expect(typeof container.searchPhones.execute).toBe('function');
    expect(typeof container.getPhoneDetail.execute).toBe('function');
  });
});
