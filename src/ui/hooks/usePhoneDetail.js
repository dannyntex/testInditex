import { useEffect, useMemo, useState } from 'react';
import { createClientContainer } from '../../shared/di/container';
import { useInitialRouteData } from '../context/InitialStateContext';

/**
 * Hook: detalle de un teléfono para la vista Detalle.
 *
 * El estado inicial (resultado del loader de servidor) llega vía
 * `useInitialRouteData`, que ya comprueba que corresponde a la ruta
 * actual (mismo pathname, es decir, mismo `id`): si el usuario llegó aquí
 * navegando del lado cliente desde el Listado (SPA, sin recarga), o desde
 * la carga completa de OTRA ruta, ese hook devuelve `null` y aquí se pide
 * el detalle vía el BFF. Si coincide, no hay refetch.
 *
 * @param {Object} params
 * @param {string} params.id
 * @returns {{ detail: import('../../modules/phones/domain/PhoneDetail').PhoneDetail | null }}
 */
export function usePhoneDetail({ id }) {
  const container = useMemo(() => createClientContainer(), []);
  const initialDetail = useInitialRouteData();
  const [detail, setDetail] = useState(initialDetail ?? null);

  useEffect(() => {
    if (initialDetail) {
      return undefined;
    }

    let cancelled = false;
    container.getPhoneDetail.execute(id).then((result) => {
      if (!cancelled) {
        setDetail(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id, container, initialDetail]);

  return { detail };
}
