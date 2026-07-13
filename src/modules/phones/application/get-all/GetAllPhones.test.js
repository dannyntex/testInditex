import { Phone } from '../../domain/Phone';
import { InMemoryPhoneRepository } from '../__fakes__/InMemoryPhoneRepository';
import { createGetAllPhones } from './GetAllPhones';

describe('GetAllPhones', () => {
  it('returns every phone from the repository', async () => {
    const phones = [
      new Phone({
        id: 'SMG-S24U',
        brand: 'Samsung',
        name: 'Galaxy S24 Ultra',
        basePrice: 1329,
        imageUrl: 'a',
      }),
      new Phone({ id: 'GPX-8A', brand: 'Google', name: 'Pixel 8a', basePrice: 459, imageUrl: 'b' }),
    ];
    const phoneRepository = new InMemoryPhoneRepository(phones);
    const getAllPhones = createGetAllPhones(phoneRepository);

    const result = await getAllPhones.execute();

    expect(result).toEqual(phones);
  });

  it('returns an empty list when the repository has no phones', async () => {
    const getAllPhones = createGetAllPhones(new InMemoryPhoneRepository([]));

    const result = await getAllPhones.execute();

    expect(result).toEqual([]);
  });
});
