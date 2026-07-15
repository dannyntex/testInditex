import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

/**
 * Barra de navegación: enlace a inicio + icono de carrito con cantidad.
 * La cantidad llega por prop (por defecto 0); la lectura en vivo desde
 * localStorage vía `useCart` se conecta en el hito de vista Carrito (6),
 * para no adelantar esa capa aquí.
 *
 * @param {Object} [props]
 * @param {number} [props.cartCount]
 */
export function Navbar({ cartCount = 0 }) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        Phone Store
      </Link>
      <Link to="/cart" className={styles.cart} aria-label={`Carrito, ${cartCount} productos`}>
        <BagIcon className={styles.bagIcon} />
        <span aria-hidden="true">{cartCount}</span>
      </Link>
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
