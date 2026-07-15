import { useEffect, useMemo, useRef, useState } from 'react';
import { createClientContainer } from '../../shared/di/container';

const DEBOUNCE_MS = 300;

/**
 * Hook: búsqueda en tiempo real de teléfonos vía el caso de uso `SearchPhones`
 * (cliente -> `HttpPhoneRepository` -> nuestro BFF, filtrado por API), con
 * debounce. No refetchea en el montaje inicial (usa `initialPhones`, ya
 * resuelto por el loader de servidor); solo dispara peticiones cuando
 * cambia `query` después de eso.
 *
 * Decisión explícita: con `query` vacío (tras recortar espacios), vuelve al
 * listado completo (`GetAllPhones`) en vez de llamar a `search('')`.
 *
 * @param {Object} [params]
 * @param {import('../../modules/phones/domain/Phone').Phone[]} [params.initialPhones]
 * @returns {{
 *   query: string,
 *   setQuery: (value: string) => void,
 *   phones: import('../../modules/phones/domain/Phone').Phone[],
 * }}
 */
export function useSearchPhones({ initialPhones = [] } = {}) {
  const container = useMemo(() => createClientContainer(), []);
  const [query, setQuery] = useState('');
  const [phones, setPhones] = useState(initialPhones);
  const isFirstRender = useRef(true);
  const latestRequestId = useRef(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }

    const requestId = ++latestRequestId.current;
    const trimmedQuery = query.trim();

    const timeoutId = setTimeout(async () => {
      const result = trimmedQuery
        ? await container.searchPhones.execute(trimmedQuery)
        : await container.getAllPhones.execute();

      if (requestId === latestRequestId.current) {
        setPhones(result);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, container]);

  return { query, setQuery, phones };
}
