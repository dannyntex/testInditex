import { PhoneCard } from '../../components/PhoneCard/PhoneCard';
import styles from './PhoneList.module.css';

/**
 * Vista Listado: grid de tarjetas de teléfono. En este hito recibe el
 * listado completo ya resuelto por el loader de servidor (SSR, sin
 * refetch en cliente); el buscador en tiempo real llega en el siguiente commit.
 *
 * @param {Object} props
 * @param {import('../../../modules/phones/domain/Phone').Phone[]} [props.initialData]
 */
export function PhoneList({ initialData }) {
  const phones = initialData ?? [];

  return (
    <main className={styles.main}>
      <ul className={styles.grid}>
        {phones.map((phone, index) => (
          // La API externa puede repetir `id` entre productos distintos del
          // listado; se combina con el índice para una key de React única.
          <li key={`${phone.id}-${index}`}>
            <PhoneCard phone={phone} />
          </li>
        ))}
      </ul>
    </main>
  );
}
