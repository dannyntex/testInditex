import { Link } from 'react-router-dom';
import styles from './PhoneCard.module.css';

/**
 * Tarjeta de teléfono en el grid del listado: imagen, marca, nombre y precio
 * base. Enlace navegable por teclado a la vista de detalle.
 *
 * @param {Object} props
 * @param {import('../../../modules/phones/domain/Phone').Phone} props.phone
 */
export function PhoneCard({ phone }) {
  const { id, brand, name, basePrice, imageUrl } = phone;

  return (
    <Link to={`/phone/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={imageUrl} alt={`${brand} ${name}`} className={styles.image} />
      </div>
      <div className={styles.info}>
        <div className={styles.brandName}>
          <span className={styles.brand}>{brand}</span>
          <span className={styles.name}>{name}</span>
        </div>
        <span className={styles.price}>{basePrice} EUR</span>
      </div>
    </Link>
  );
}
