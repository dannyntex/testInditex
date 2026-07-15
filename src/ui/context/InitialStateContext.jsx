import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const InitialStateContext = createContext(null);

/**
 * @param {Object} props
 * @param {{ pathname: string, data: unknown } | null} props.value
 * @param {import('react').ReactNode} props.children
 */
export function InitialStateProvider({ value, children }) {
  return <InitialStateContext.Provider value={value}>{children}</InitialStateContext.Provider>;
}

/**
 * Estado inicial (resultado del loader de servidor) para la vista actual,
 * pero SOLO si de verdad se calculó para la ruta que se está renderizando
 * ahora mismo (mismo `pathname` exacto).
 *
 * `window.__INITIAL_STATE__` es un único valor global: lo produjo el
 * loader de la ruta que sirvió la carga completa (SSR), no todas. Si el
 * usuario navega del lado cliente a otra vista, ese valor sigue en
 * memoria pero ya no corresponde a lo que se está pintando — usarlo a
 * ciegas ahí puede pasarle a un hook datos con una forma completamente
 * distinta (p.ej. un `PhoneDetail` a un hook que espera un array de
 * `Phone`, o viceversa).
 *
 * Mecanismo único y compartido: cualquier hook que consuma el resultado
 * de un loader de servidor pasa por aquí en vez de reinventar su propia
 * comparación (antes `usePhoneDetail` comparaba `initialDetail.id === id`
 * a mano; `useSearchPhones` no comparaba nada, y ahí estaba el bug).
 *
 * @returns {unknown} el dato del loader si coincide con la ruta actual; `null` si no.
 */
export function useInitialRouteData() {
  const initialState = useContext(InitialStateContext);
  const { pathname } = useLocation();

  if (!initialState || initialState.pathname !== pathname) {
    return null;
  }
  return initialState.data;
}
