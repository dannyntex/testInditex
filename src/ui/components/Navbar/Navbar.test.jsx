import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { routerFuture } from '../../routerFuture';
import { Navbar } from './Navbar';

const STORAGE_KEY = 'zara-challenge:cart';

function renderNavbar() {
  return render(
    <MemoryRouter future={routerFuture}>
      <CartProvider>
        <Navbar />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('Navbar — cart badge', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('starts at 0 (SSR-safe) and updates to the real persisted count after mounting', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items: [
          {
            id: '1',
            phoneId: 'A',
            name: 'A',
            imageUrl: '/a.png',
            color: 'Black',
            storage: '1',
            price: 10,
          },
          {
            id: '2',
            phoneId: 'B',
            name: 'B',
            imageUrl: '/b.png',
            color: 'Black',
            storage: '1',
            price: 20,
          },
        ],
      }),
    );

    renderNavbar();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Carrito, 2 productos' })).toBeInTheDocument();
    });
  });

  it('shows 0 productos when the cart is empty', async () => {
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Carrito, 0 productos' })).toBeInTheDocument();
    });
  });
});
