import { useId } from 'react';
import { PhoneCard } from '../../components/PhoneCard/PhoneCard';
import { useSearchPhones } from '../../hooks/useSearchPhones';
import styles from './PhoneList.module.css';

/**
 * Vista Listado: buscador en tiempo real + contador de resultados + grid de
 * tarjetas. El listado inicial (SSR, sin refetch) llega por `initialData`;
 * `useSearchPhones` toma el relevo en cuanto el usuario escribe.
 *
 * @param {Object} props
 * @param {import('../../../modules/phones/domain/Phone').Phone[]} [props.initialData]
 */
export function PhoneList({ initialData }) {
  const searchInputId = useId();
  const { query, setQuery, phones } = useSearchPhones({ initialPhones: initialData ?? [] });

  return (
    <main className={styles.main}>
      <h1 className={styles.visuallyHidden}>Phone catalog</h1>
      <div className={styles.searchWrapper}>
        <div className={styles.search}>
          <SearchIcon className={styles.searchIcon} />
          <label htmlFor={searchInputId} className={styles.visuallyHidden}>
            Search for a smartphone
          </label>
          <input
            id={searchInputId}
            type="search"
            className={styles.searchInput}
            placeholder="Search for a smartphone..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className={styles.resultsCount} aria-live="polite">
          {phones.length} RESULTS
        </p>
      </div>

      {phones.length === 0 ? (
        <p className={styles.empty}>No results found.</p>
      ) : (
        <ul className={styles.grid}>
          {phones.map((phone, index) => (
            // La API externa puede repetir `id` entre productos distintos del
            // listado; se combina con el índice para una key de React única.
            <li key={`${phone.id}-${index}`}>
              <PhoneCard phone={phone} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.4" />
      <line
        x1="13.2"
        y1="13.2"
        x2="18"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
