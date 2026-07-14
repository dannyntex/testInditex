import { Phone } from '../domain/Phone';
import { PhoneDetail } from '../domain/PhoneDetail';
import productDetailResponse from './__fixtures__/productDetailResponse.json';
import productListResponse from './__fixtures__/productListResponse.json';
import { toPhone, toPhoneDetail, toPhoneList } from './phoneApiMapper';

describe('toPhone / toPhoneList', () => {
  it('maps a raw list item 1:1 into a Phone (no extra/missing fields)', () => {
    const [rawPhone] = productListResponse;

    const phone = toPhone(rawPhone);

    expect(phone).toBeInstanceOf(Phone);
    expect(phone).toEqual({
      id: 'SMG-S24U',
      brand: 'Samsung',
      name: 'Galaxy S24 Ultra',
      basePrice: 1329,
      imageUrl: rawPhone.imageUrl,
    });
  });

  it('maps every item of the real /products fixture', () => {
    const phones = toPhoneList(productListResponse);

    expect(phones).toHaveLength(productListResponse.length);
    expect(phones.every((phone) => phone instanceof Phone)).toBe(true);
  });
});

describe('toPhoneDetail', () => {
  it('maps the real /products/{id} fixture into a clean PhoneDetail', () => {
    const detail = toPhoneDetail(productDetailResponse);

    expect(detail).toBeInstanceOf(PhoneDetail);
    expect(detail.id).toBe('SMG-S24U');
    expect(detail.description).toBe(productDetailResponse.description);
    expect(detail.rating).toBe(4.6);
    expect(detail.specs).toEqual(productDetailResponse.specs);
  });

  it('normalizes storageOptions to a priceDelta instead of the API absolute price', () => {
    const detail = toPhoneDetail(productDetailResponse);

    expect(detail.storageOptions).toEqual([
      { capacity: '256 GB', priceDelta: -100 },
      { capacity: '512 GB', priceDelta: 0 },
      { capacity: '1 TB', priceDelta: 200 },
    ]);
  });

  it('keeps colorOptions without inventing a price field the API does not provide', () => {
    const detail = toPhoneDetail(productDetailResponse);

    expect(detail.colorOptions).toEqual([
      { name: 'Titanium Violet', hexCode: '#8E6F96', imageUrl: expect.any(String) },
      { name: 'Titanium Black', hexCode: '#000000', imageUrl: expect.any(String) },
      { name: 'Titanium Gray', hexCode: '#808080', imageUrl: expect.any(String) },
      { name: 'Titanium Yellow', hexCode: '#FFFF00', imageUrl: expect.any(String) },
    ]);
    expect(detail.colorOptions.every((color) => !('priceDelta' in color))).toBe(true);
  });

  it('defaults the detail imageUrl to the first color image (the API has no top-level imageUrl)', () => {
    const detail = toPhoneDetail(productDetailResponse);

    expect(detail.imageUrl).toBe(productDetailResponse.colorOptions[0].imageUrl);
  });

  it('maps similarProducts into Phone instances', () => {
    const detail = toPhoneDetail(productDetailResponse);

    expect(detail.similarProducts).toHaveLength(productDetailResponse.similarProducts.length);
    expect(detail.similarProducts.every((phone) => phone instanceof Phone)).toBe(true);
    expect(detail.similarProducts[0].id).toBe('XMI-RN13P5G');
  });
});
