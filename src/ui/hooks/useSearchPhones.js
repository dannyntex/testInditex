import { useEffect, useMemo, useRef, useState } from 'react';
import { createClientContainer } from '../../shared/di/container';
import { useInitialRouteData } from '../context/InitialStateContext';

const DEBOUNCE_MS = 300;

/**
 * Hook: búsqueda en tiempo real de teléfonos vía el caso de uso `SearchPhones`
 * (cliente -> `HttpPhoneRepository` -> nuestro BFF, filtrado por API), con
 * debounce.
 *
 * El estado inicial (resultado del loader de servidor) llega vía
 * `useInitialRouteData`, que ya comprueba que corresponde a la ruta actual:
 * si coincide, no hay refetch en el montaje. Si no (el usuario llegó aquí
 * navegando del lado cliente desde otra vista, o la carga completa fue de
 * otra ruta), se pide el listado completo de inmediato, sin esperar al
 * debounce (el debounce es solo para cuando el usuario teclea después).
 *
 * Decisión explícita: con `query` vacío (tras recortar espacios), vuelve al
 * listado completo (`GetAllPhones`) en vez de llamar a `search('')`.
 *
 * @returns {{
 *   query: string,
 *   setQuery: (value: string) => void,
 *   phones: import('../../modules/phones/domain/Phone').Phone[],
 * }}
 */
export function useSearchPhones() {
  const container = useMemo(() => createClientContainer(), []);
  const initialPhones = useInitialRouteData();
  const [query, setQuery] = useState('');
  const [phones, setPhones] = useState(initialPhones ?? []);
  const isFirstRender = useRef(true);
  const latestRequestId = useRef(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (initialPhones) {
        return undefined;
      }

      const requestId = ++latestRequestId.current;
      container.getAllPhones.execute().then((result) => {
        if (requestId === latestRequestId.current) {
          setPhones(result);
        }
      });
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
  }, [query, container, initialPhones]);

  return { query, setQuery, phones };
}
