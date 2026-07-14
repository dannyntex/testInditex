import { Phone } from '../domain/Phone';
import { PhoneDetail } from '../domain/PhoneDetail';
import { ApiPhoneRepository } from './ApiPhoneRepository';
import productDetailResponse from './__fixtures__/productDetailResponse.json';
import productListResponse from './__fixtures__/productListResponse.json';

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
});

describe('ApiPhoneRepository', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  const repository = () =>
    new ApiPhoneRepository({ baseUrl: 'https://api.example.test', apiKey: 'secret-key' });

  describe('getAll', () => {
    it('calls GET /products with the x-api-key header and maps the result to Phone[]', async () => {
      global.fetch.mockResolvedValue(jsonResponse(200, productListResponse));

      const result = await repository().getAll();

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/products', {
        headers: { 'x-api-key': 'secret-key' },
      });
      expect(result.every((phone) => phone instanceof Phone)).toBe(true);
      expect(result).toHaveLength(productListResponse.length);
    });
  });

  describe('search', () => {
    it('calls GET /products?search=<query> with the x-api-key header', async () => {
      global.fetch.mockResolvedValue(jsonResponse(200, [productListResponse[0]]));

      const result = await repository().search('samsung');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.test/products?search=samsung',
        { headers: { 'x-api-key': 'secret-key' } },
      );
      expect(result).toEqual([new Phone(productListResponse[0])]);
    });
  });

  describe('getById', () => {
    it('calls GET /products/{id} with the x-api-key header and maps the result to PhoneDetail', async () => {
      global.fetch.mockResolvedValue(jsonResponse(200, productDetailResponse));

      const result = await repository().getById('SMG-S24U');

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/products/SMG-S24U', {
        headers: { 'x-api-key': 'secret-key' },
      });
      expect(result).toBeInstanceOf(PhoneDetail);
      expect(result.id).toBe('SMG-S24U');
    });

    it('propagates an HttpError with status 404 when the phone does not exist', async () => {
      global.fetch.mockResolvedValue(
        jsonResponse(404, { error: 'NOT-FOUND', message: 'Product not found' }),
      );

      await expect(repository().getById('unknown')).rejects.toMatchObject({ status: 404 });
    });
  });
});
