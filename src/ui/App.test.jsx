import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { routerFuture } from './routerFuture';

/**
 * Reproduce el bug: la carga completa (SSR) fue de una ruta que NO es el
 * Listado (`/cart`, sin loader, `data: null`), y luego se navega del lado
 * cliente a `/`. `window.__INITIAL_STATE__`/`initialState` es un único
 * valor global (el de `/cart`); antes de este fix, `useSearchPhones` lo
 * usaba a ciegas vía la prop `initialData` que repartía `App` a TODAS las
 * rutas, así que `phones` terminaba con la forma equivocada y
 * `phones.map` reventaba al renderizar el grid. Ahora cada hook comprueba
 * vía `useInitialRouteData` que el estado inicial es realmente el suyo
 * (mismo pathname) antes de usarlo.
 */
function jsonResponse(body) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

describe('App — estado inicial guardado por ruta', () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        jsonResponse([
          { id: 'A1', brand: 'Acme', name: 'Phone One', basePrice: 100, imageUrl: '/a.png' },
        ]),
      );
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('renderiza el Listado sin crash al navegar del lado cliente desde /cart a /', async () => {
    const initialState = { pathname: '/cart', data: null };

    render(
      <MemoryRouter initialEntries={['/cart']} future={routerFuture}>
        <App initialState={initialState} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /carrito/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /phone store/i }));

    expect(await screen.findByRole('heading', { name: /phone catalog/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Phone One')).toBeInTheDocument();
    });
  });
});
