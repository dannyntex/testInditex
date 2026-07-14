import { getJson, HttpError } from './httpClient';

describe('getJson', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('builds an absolute URL with query params and returns the parsed JSON body', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ id: '1' }]),
    });

    const result = await getJson({
      baseUrl: 'https://api.example.test',
      path: '/products',
      query: { search: 'pixel' },
      headers: { 'x-api-key': 'secret' },
    });

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/products?search=pixel', {
      headers: { 'x-api-key': 'secret' },
    });
    expect(result).toEqual([{ id: '1' }]);
  });

  it('omits undefined/empty query params', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve([]) });

    await getJson({
      baseUrl: 'https://api.example.test',
      path: '/products',
      query: { search: '' },
    });

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/products', {
      headers: undefined,
    });
  });

  it('builds a relative URL when there is no baseUrl (client usage)', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });

    await getJson({ path: '/api/phones/SMG-S24U' });

    expect(global.fetch).toHaveBeenCalledWith('/api/phones/SMG-S24U', { headers: undefined });
  });

  it('throws HttpError with the status and parsed body when the response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'NOT-FOUND', message: 'Product not found' }),
    });

    await expect(getJson({ path: '/products/unknown' })).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
      body: { error: 'NOT-FOUND', message: 'Product not found' },
    });
  });

  it('still throws HttpError when the error response has no JSON body', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(getJson({ path: '/products' })).rejects.toBeInstanceOf(HttpError);
  });
});
