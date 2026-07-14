import styles from './App.module.css';

/**
 * Componente raíz (hito 1b: esqueleto SSR, sin lógica de negocio). Prueba
 * de extremo a extremo: renderizado en servidor, hidratado en cliente, CSS
 * Modules con clases con el mismo hash en los dos lados.
 * Las rutas reales (Listado/Detalle/Carrito) llegan en los hitos 4-6.
 */
export default function App() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Hola desde el servidor</h1>
      <p>Zara Challenge — esqueleto SSR (hito 1b).</p>
    </main>
  );
}
