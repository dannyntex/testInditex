import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { routerFuture } from '../../routerFuture';
import { PhoneList } from './PhoneList';

function jsonResponse(body) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

function phone(id, name) {
  return { id, brand: 'Acme', name, basePrice: 100, imageUrl: `/${id}.png` };
}

describe('PhoneList — search bar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.fetch;
  });

  it('shows the results count matching the phones fetched on mount', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse([phone('A1', 'Phone One'), phone('A2', 'Phone Two')]),
    );

    render(
      <MemoryRouter future={routerFuture}>
        <PhoneList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('2 RESULTS')).toBeInTheDocument();
    });
    expect(screen.getByText('Phone One')).toBeInTheDocument();
    expect(screen.getByText('Phone Two')).toBeInTheDocument();
  });

  it('does not call the search endpoint until the debounce elapses, then filters by the typed query', async () => {
    global.fetch.mockResolvedValue(jsonResponse([phone('A1', 'Phone One')]));

    render(
      <MemoryRouter future={routerFuture}>
        <PhoneList />
      </MemoryRouter>,
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    global.fetch.mockResolvedValue(jsonResponse([phone('A2', 'Only Match')]));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'only' } });

    // Sin esperar el debounce, no debe haber disparado ninguna petición nueva.
    expect(global.fetch).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/phones?search=only', { headers: undefined });
    await waitFor(() => {
      expect(screen.getByText('1 RESULTS')).toBeInTheDocument();
    });
    expect(screen.getByText('Only Match')).toBeInTheDocument();
    expect(screen.queryByText('Phone One')).not.toBeInTheDocument();
  });
});
