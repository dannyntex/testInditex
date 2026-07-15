import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import styles from './Cart.module.css';

/**
 * Vista Carrito (`/cart`): una línea por producto (imagen, nombre, specs
 * elegidas y precio individual), botón eliminar por línea, precio total
 * (`Cart.total()` del dominio, no sumado a mano aquí) y "Continuar
 * comprando" → inicio. No hay control de cantidad en el diseño: añadir la
 * misma variante dos veces crea dos líneas (ver `Cart.addItem`), así que
 * cada línea se elimina por su propio id, no por teléfono/color/almacenamiento.
 */
export function Cart() {
  const { cart, removeFromCart } = useCart();
  const isEmpty = cart.items.length === 0;

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Carrito ({cart.items.length})</h1>

      {isEmpty ? (
        <p className={styles.empty}>Tu carrito está vacío.</p>
      ) : (
        <ul className={styles.list}>
          {cart.items.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.imageWrapper}>
                <img src={item.imageUrl} alt={item.name} className={styles.image} />
              </div>
              <div className={styles.infoDelete}>
                <div className={styles.info}>
                  <div className={styles.nameSpecs}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.specs}>
                      {item.storage} | {item.color}
                    </span>
                  </div>
                  <span className={styles.price}>{item.price} EUR</span>
                </div>
                <button
                  type="button"
                  className={styles.delete}
                  onClick={() => removeFromCart(item)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.footer}>
        <Link to="/" className={styles.continueShopping}>
          Continuar comprando
        </Link>
        {!isEmpty && (
          <div className={styles.total}>
            <span>Total</span>
            <span>{cart.total()} EUR</span>
          </div>
        )}
        <button type="button" className={styles.pay} disabled>
          Pagar
        </button>
      </div>
    </main>
  );
}
