import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { InitialStateProvider } from '../../context/InitialStateContext';
import { routerFuture } from '../../routerFuture';
import { PhoneDetail } from './PhoneDetail';

const detail = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1000,
  imageUrl: '/base.png',
  description: 'A phone.',
  specs: {
    screen: '6.8"',
    resolution: '1440p',
    processor: 'Snapdragon',
    mainCamera: '200MP',
    selfieCamera: '12MP',
    battery: '5000mAh',
    os: 'Android',
    screenRefreshRate: '120Hz',
  },
  colorOptions: [
    { name: 'Black', hexCode: '#000000', imageUrl: '/black.png' },
    { name: 'Violet', hexCode: '#8E6F96', imageUrl: '/violet.png' },
  ],
  storageOptions: [
    { capacity: '256 GB', priceDelta: -100 },
    { capacity: '512 GB', priceDelta: 0 },
  ],
  similarProducts: [],
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/phone/SMG-S24U']} future={routerFuture}>
      <InitialStateProvider value={{ pathname: '/phone/SMG-S24U', data: detail }}>
        <CartProvider>
          <Routes>
            <Route path="/phone/:id" element={<PhoneDetail />} />
          </Routes>
        </CartProvider>
      </InitialStateProvider>
    </MemoryRouter>,
  );
}

describe('PhoneDetail — selectors', () => {
  it('disables "Add to cart" until both storage and color are chosen', () => {
    renderDetail();

    const addButton = screen.getByRole('button', { name: /añadir al carrito/i });
    expect(addButton).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /256 gb/i }));
    expect(addButton).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /black/i }));
    expect(addButton).toBeEnabled();
  });

  it('updates the price in real time as soon as storage is picked, before any color is chosen', () => {
    renderDetail();

    expect(screen.getByText('Desde 1000 EUR')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /256 gb/i }));
    expect(screen.getByText('900 EUR')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /512 gb/i }));
    expect(screen.getByText('1000 EUR')).toBeInTheDocument();
  });

  it('confirms the add-to-cart action once a full variant is selected', () => {
    renderDetail();

    fireEvent.click(screen.getByRole('radio', { name: /512 gb/i }));
    fireEvent.click(screen.getByRole('radio', { name: /violet/i }));
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));

    expect(screen.getByText('Añadido al carrito')).toBeInTheDocument();
  });
});
