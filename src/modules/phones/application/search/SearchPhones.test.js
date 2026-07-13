import { Phone } from '../../domain/Phone';
import { InMemoryPhoneRepository } from '../__fakes__/InMemoryPhoneRepository';
import { createSearchPhones } from './SearchPhones';

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

describe('SearchPhones', () => {
  it('delegates the query to the repository and returns the matches', async () => {
    const searchPhones = createSearchPhones(new InMemoryPhoneRepository(phones));

    const result = await searchPhones.execute('pixel');

    expect(result).toEqual([phones[1]]);
  });

  it('returns an empty list when nothing matches', async () => {
    const searchPhones = createSearchPhones(new InMemoryPhoneRepository(phones));

    const result = await searchPhones.execute('nokia');

    expect(result).toEqual([]);
  });
});
