import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import styles from './Navbar.module.css';

/**
 * Barra de navegación: enlace a inicio + icono de carrito con cantidad.
 * La cantidad sale de `useCart` (líneas del carrito real en localStorage):
 * en servidor y en la primera pasada de cliente antes de montar, el
 * carrito está vacío a propósito (mismatch-safe), así que el badge
 * arranca en 0 y se actualiza solo tras montar, sin salto visible más
 * que el propio número.
 */
export function Navbar() {
  const { count } = useCart();

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Principal">
        <Link to="/" className={styles.brand}>
          Phone Store
        </Link>
        <Link to="/cart" className={styles.cart} aria-label={`Carrito, ${count} productos`}>
          <BagIcon className={styles.bagIcon} />
          <span aria-hidden="true">{count}</span>
        </Link>
      </nav>
    </header>
  );
}

function BagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4.5 5.5V4a4.5 4.5 0 0 1 9 0v1.5M2 5.5h14l-1 11H3l-1-11Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
