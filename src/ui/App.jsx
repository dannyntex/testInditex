import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { CartProvider } from './context/CartContext';
import { InitialStateProvider } from './context/InitialStateContext';
import { useRouteFocus } from './hooks/useRouteFocus';
import { routes } from './routes';
import styles from './App.module.css';

/**
 * Componente raíz: InitialStateProvider + CartProvider + Navbar + rutas.
 * `initialState` (`{ pathname, data }`) es el resultado del `loader` de la
 * ruta que sirvió la carga completa (SSR), junto con el pathname para el
 * que se calculó — cada vista lo consume vía `useInitialRouteData` (dentro
 * de sus propios hooks), que solo lo entrega si coincide con la ruta que
 * se está pintando; así ninguna vista recibe por error el dato de otra.
 *
 * @param {Object} [props]
 * @param {{ pathname: string, data: unknown } | null} [props.initialState]
 */
export default function App({ initialState = null }) {
  useRouteFocus();

  return (
    <InitialStateProvider value={initialState}>
      <CartProvider>
        <div className={styles.app}>
          <Navbar />
          <Routes>
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </div>
      </CartProvider>
    </InitialStateProvider>
  );
}
