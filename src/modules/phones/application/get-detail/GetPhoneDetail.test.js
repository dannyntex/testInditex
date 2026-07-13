import { PhoneDetail } from '../../domain/PhoneDetail';
import { InMemoryPhoneRepository } from '../__fakes__/InMemoryPhoneRepository';
import { createGetPhoneDetail } from './GetPhoneDetail';

const detail = new PhoneDetail({
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1329,
  imageUrl: 'a',
  description: 'desc',
  rating: 4.6,
  specs: { screen: '6.8"' },
  colorOptions: [{ name: 'Titanium Black', hexCode: '#000000', imageUrl: 'a-black' }],
  storageOptions: [{ capacity: '256 GB', priceDelta: -100 }],
  similarProducts: [],
});

describe('GetPhoneDetail', () => {
  it('returns the detail for a known id', async () => {
    const phoneRepository = new InMemoryPhoneRepository([], new Map([[detail.id, detail]]));
    const getPhoneDetail = createGetPhoneDetail(phoneRepository);

    const result = await getPhoneDetail.execute('SMG-S24U');

    expect(result).toBe(detail);
  });

  it('propagates the repository error for an unknown id', async () => {
    const getPhoneDetail = createGetPhoneDetail(new InMemoryPhoneRepository());

    await expect(getPhoneDetail.execute('unknown')).rejects.toThrow('Phone not found: unknown');
  });
});
