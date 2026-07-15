import { useEffect, useMemo, useState } from 'react';
import { createClientContainer } from '../../shared/di/container';

/**
 * Hook: detalle de un teléfono para la vista Detalle.
 *
 * `initialDetail` es el `initialData` que reparte `App` a todas las rutas
 * (el resultado del loader ejecutado en servidor para la ruta que hizo el
 * primer render). Solo es válido para ESTA vista si de verdad corresponde
 * al `id` de la URL actual: si el usuario llegó aquí navegando del lado
 * cliente desde el Listado (SPA, sin recarga), `initialData` seguiría
 * siendo el array de `Phone` de esa otra ruta, no un `PhoneDetail`. En ese
 * caso (y solo en ese caso) se pide el detalle vía el BFF; si coincide, no
 * hay refetch.
 *
 * @param {Object} params
 * @param {string} params.id
 * @param {unknown} [params.initialDetail]
 * @returns {{
 *   detail: import('../../modules/phones/domain/PhoneDetail').PhoneDetail | null,
 *   container: ReturnType<typeof createClientContainer>,
 * }}
 */
export function usePhoneDetail({ id, initialDetail = null }) {
  const container = useMemo(() => createClientContainer(), []);
  const matchesRoute = Boolean(initialDetail) && initialDetail.id === id;
  const [detail, setDetail] = useState(matchesRoute ? initialDetail : null);

  useEffect(() => {
    if (matchesRoute) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matchesRoute deriva de initialDetail/id, no hace falta repetirlo
  }, [id, container]);

  return { detail, container };
}
