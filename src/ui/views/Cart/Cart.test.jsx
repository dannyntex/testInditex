import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { routerFuture } from '../../routerFuture';
import { Cart } from './Cart';

const STORAGE_KEY = 'zara-challenge:cart';

function seedCart(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
}

function renderCart() {
  return render(
    <MemoryRouter future={routerFuture}>
      <CartProvider>
        <Cart />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('Cart — line items', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('removes only the exact duplicate line clicked, leaving its identical twin intact', async () => {
    // Misma variante exacta (mismo teléfono, color y almacenamiento) añadida
    // dos veces: el dominio permite líneas duplicadas a propósito (ver
    // Cart.js), así que eliminar una NO debe afectar a la otra.
    seedCart([
      {
        id: 'line-1',
        phoneId: 'SMG-S24U',
        name: 'Galaxy S24 Ultra',
        imageUrl: '/img.png',
        color: 'Titanium Violet',
        storage: '512 GB',
        price: 1329,
      },
      {
        id: 'line-2',
        phoneId: 'SMG-S24U',
        name: 'Galaxy S24 Ultra',
        imageUrl: '/img.png',
        color: 'Titanium Violet',
        storage: '512 GB',
        price: 1329,
      },
    ]);

    renderCart();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Carrito (2)' })).toBeInTheDocument();
    });
    expect(screen.getByText('2658 EUR')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Carrito (1)' })).toBeInTheDocument();
    });
    expect(screen.getAllByRole('button', { name: /eliminar/i })).toHaveLength(1);
    // Una para el precio de la línea restante, otra para el total (mismo
    // valor porque solo queda 1 unidad a 1329).
    expect(screen.getAllByText('1329 EUR')).toHaveLength(2);
  });

  it('shows the empty state once the last line is removed', async () => {
    seedCart([
      {
        id: 'line-1',
        phoneId: 'SMG-S24U',
        name: 'Galaxy S24 Ultra',
        imageUrl: '/img.png',
        color: 'Titanium Violet',
        storage: '512 GB',
        price: 1329,
      },
    ]);

    renderCart();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    });
  });
});
