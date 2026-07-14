import { Phone } from '../domain/Phone';
import { PhoneDetail } from '../domain/PhoneDetail';
import productDetailResponse from './__fixtures__/productDetailResponse.json';
import productListResponse from './__fixtures__/productListResponse.json';
import { toPhoneDetail, toPhoneList } from './phoneApiMapper';
import { HttpPhoneRepository } from './HttpPhoneRepository';

// El BFF ya devuelve datos con forma de dominio (mapeados por ApiPhoneRepository
// en el servidor): estas fixtures simulan esa respuesta serializando lo que
// produciría el mapper, no el JSON crudo de la API externa.
const bffPhoneList = JSON.parse(JSON.stringify(toPhoneList(productListResponse)));
const bffPhoneDetail = JSON.parse(JSON.stringify(toPhoneDetail(productDetailResponse)));

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
});

describe('HttpPhoneRepository', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  describe('getAll', () => {
    it('calls GET /api/phones without any x-api-key header', async () => {
      global.fetch.mockResolvedValue(jsonResponse(200, bffPhoneList));

      const result = await new HttpPhoneRepository().getAll();

      expect(global.fetch).toHaveBeenCalledWith('/api/phones', { headers: undefined });
      expect(result.every((phone) => phone instanceof Phone)).toBe(true);
      expect(result).toHaveLength(bffPhoneList.length);
    });
  });

  describe('search', () => {
    it('calls GET /api/phones?search=<query>', async () => {
      global.fetch.mockResolvedValue(jsonResponse(200, [bffPhoneList[0]]));

      const result = await new HttpPhoneRepository().search('samsung');

      expect(global.fetch).toHaveBeenCalledWith('/api/phones?search=samsung', {
        headers: undefined,
      });
      expect(result).toEqual([new Phone(bffPhoneList[0])]);
    });
  });

  describe('getById', () => {
    it('calls GET /api/phones/:id and returns a PhoneDetail', async () => {
      global.fetch.mockResolvedValue(jsonResponse(200, bffPhoneDetail));

      const result = await new HttpPhoneRepository().getById('SMG-S24U');

      expect(global.fetch).toHaveBeenCalledWith('/api/phones/SMG-S24U', { headers: undefined });
      expect(result).toBeInstanceOf(PhoneDetail);
      expect(result.storageOptions).toEqual(bffPhoneDetail.storageOptions);
    });
  });

  it('supports an explicit baseUrl (useful for tests or non-relative setups)', async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, bffPhoneList));

    await new HttpPhoneRepository({ baseUrl: 'http://localhost:3000' }).getAll();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/phones', {
      headers: undefined,
    });
  });
});
