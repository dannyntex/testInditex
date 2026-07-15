/** @jest-environment node */
import { getServerConfig } from './env';

describe('getServerConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws when PHONES_API_KEY is missing', () => {
    delete process.env.PHONES_API_KEY;

    expect(() => getServerConfig()).toThrow('PHONES_API_KEY');
  });

  it('reads the key and base URL from process.env', () => {
    process.env.PHONES_API_KEY = 'test-key';
    process.env.PHONES_API_BASE_URL = 'https://example.test';

    expect(getServerConfig()).toEqual({
      phonesApiKey: 'test-key',
      phonesApiBaseUrl: 'https://example.test',
    });
  });

  it('throws when PHONES_API_BASE_URL is missing', () => {
    process.env.PHONES_API_KEY = 'test-key';
    delete process.env.PHONES_API_BASE_URL;

    expect(() => getServerConfig()).toThrow('PHONES_API_BASE_URL');
  });
});
