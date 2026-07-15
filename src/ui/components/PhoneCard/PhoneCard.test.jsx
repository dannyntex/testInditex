import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Phone } from '../../../modules/phones/domain/Phone';
import { routerFuture } from '../../routerFuture';
import { PhoneCard } from './PhoneCard';

function renderCard(phone) {
  return render(
    <MemoryRouter future={routerFuture}>
      <PhoneCard phone={phone} />
    </MemoryRouter>,
  );
}

describe('PhoneCard', () => {
  it('links to the phone detail route for this exact id', () => {
    const phone = new Phone({
      id: 'SMG-S24U',
      brand: 'Samsung',
      name: 'Galaxy S24 Ultra',
      basePrice: 1329,
      imageUrl: '/img.webp',
    });

    renderCard(phone);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/phone/SMG-S24U');
  });

  it('shows brand, name and base price, and gives the image a brand+name alt', () => {
    const phone = new Phone({
      id: 'SMG-S24U',
      brand: 'Samsung',
      name: 'Galaxy S24 Ultra',
      basePrice: 1329,
      imageUrl: '/img.webp',
    });

    renderCard(phone);

    expect(screen.getByText('Samsung')).toBeInTheDocument();
    expect(screen.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
    expect(screen.getByText('1329 EUR')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Samsung Galaxy S24 Ultra' })).toHaveAttribute(
      'src',
      '/img.webp',
    );
  });
});
