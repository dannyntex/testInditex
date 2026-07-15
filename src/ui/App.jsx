import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { routes } from './routes';
import styles from './App.module.css';

/**
 * Componente raíz: Navbar + rutas. Cada ruta recibe `initialData`, el
 * resultado de su `loader` ejecutado en servidor (o `null` si la ruta no
 * tiene loader o aún no coincide con ninguna, p.ej. `/phone/:id` en este hito).
 *
 * @param {Object} [props]
 * @param {unknown} [props.initialData]
 */
export default function App({ initialData = null }) {
  return (
    <div className={styles.app}>
      <Navbar />
      <Routes>
        {routes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component initialData={initialData} />} />
        ))}
      </Routes>
    </div>
  );
}
