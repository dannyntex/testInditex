import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartItem } from '../../../modules/cart/domain/CartItem';
import { Price } from '../../../modules/phones/domain/Price';
import { PhoneCard } from '../../components/PhoneCard/PhoneCard';
import { useCart } from '../../hooks/useCart';
import { usePhoneDetail } from '../../hooks/usePhoneDetail';
import styles from './PhoneDetail.module.css';

const SPEC_FIELDS = [
  ['screen', 'Screen'],
  ['resolution', 'Resolution'],
  ['processor', 'Processor'],
  ['mainCamera', 'Main Camera'],
  ['selfieCamera', 'Selfie Camera'],
  ['battery', 'Battery'],
  ['os', 'OS'],
  ['screenRefreshRate', 'Screen Refresh Rate'],
];

/**
 * Variación de precio de una opción de almacenamiento respecto al precio
 * base. El signo real importa (256GB puede costar MENOS que el precio
 * base): nunca se recorta a 0 (`Math.max(0, delta)`) ni se antepone un "+"
 * a ciegas al número (`+${delta}` rompería con un delta ya negativo).
 *
 * @param {number} delta
 * @returns {string}
 */
function formatPriceDelta(delta) {
  if (delta === 0) {
    return 'Incluido';
  }
  const sign = delta > 0 ? '+' : '−';
  return `${sign}${Math.abs(delta)} €`;
}

/**
 * Vista Detalle (`/phone/:id`): imagen grande que cambia según el color
 * elegido, selectores de almacenamiento/color con precio en tiempo real
 * (`Price` del dominio, sin recalcular a mano), specs técnicas y productos
 * similares. El botón "Añadir al carrito" solo se habilita con color Y
 * almacenamiento elegidos; el precio, en cambio, depende solo del
 * almacenamiento (el color no varía el precio en esta API, colorDelta
 * siempre 0 — ver Price.js), así que se actualiza en tiempo real en
 * cuanto se elige una capacidad, sin esperar a que también haya color.
 */
export function PhoneDetail() {
  const { id } = useParams();
  const { detail } = usePhoneDetail({ id });
  const { addToCart } = useCart();
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const headingRef = useRef(null);
  const startedLoading = useRef(detail == null);

  // useRouteFocus (App.jsx) enfoca el <h1> nada más cambiar de ruta, pero
  // aquí ese primer <h1> es el de "Cargando…": al llegar navegando desde el
  // Listado (sin estado inicial válido para este id, ver usePhoneDetail) no
  // hay datos todavía, así que se muestra ese marcador y LUEGO se sustituye
  // por el contenido real — un nodo del DOM distinto, así que el foco se
  // pierde (vuelve a <body>) en cuanto el marcador desaparece. Si esta
  // vista arrancó cargando, se retoma el foco en el <h1> real en cuanto
  // llegan los datos, para completar el anuncio que empezó useRouteFocus.
  useEffect(() => {
    if (detail && startedLoading.current) {
      headingRef.current?.focus();
      startedLoading.current = false;
    }
  }, [detail]);

  if (!detail) {
    return (
      <main className={styles.main}>
        <h1 className={styles.loading} tabIndex={-1}>
          Cargando…
        </h1>
      </main>
    );
  }

  const canAddToCart = Boolean(selectedStorage) && Boolean(selectedColor);
  const finalPrice = selectedStorage
    ? new Price(detail.basePrice, selectedStorage.priceDelta, 0).final()
    : null;
  const imageUrl = selectedColor?.imageUrl ?? detail.imageUrl;
  const imageAlt = selectedColor
    ? `${detail.brand} ${detail.name}, color ${selectedColor.name}`
    : `${detail.brand} ${detail.name}`;

  function handleSelectStorage(option) {
    setSelectedStorage(option);
    setAddedToCart(false);
  }

  function handleSelectColor(option) {
    setSelectedColor(option);
    setAddedToCart(false);
  }

  function handleAddToCart() {
    if (!canAddToCart) {
      return;
    }
    addToCart(
      new CartItem({
        phoneId: detail.id,
        name: detail.name,
        imageUrl: selectedColor.imageUrl,
        color: selectedColor.name,
        storage: selectedStorage.capacity,
        price: finalPrice,
      }),
    );
    setAddedToCart(true);
  }

  return (
    <main className={styles.main}>
      <Link to="/" className={styles.back}>
        ← Volver
      </Link>

      <div className={styles.top}>
        <div className={styles.imageWrapper}>
          <img src={imageUrl} alt={imageAlt} className={styles.image} />
        </div>

        <div className={styles.info}>
          <div className={styles.titlePrice}>
            <h1 className={styles.name} tabIndex={-1} ref={headingRef}>
              {detail.name}
            </h1>
            <p className={styles.price}>
              {selectedStorage ? `${finalPrice} EUR` : `Desde ${detail.basePrice} EUR`}
            </p>
          </div>

          <div className={styles.selectors}>
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Storage</legend>
              <div className={styles.storageOptions}>
                {detail.storageOptions.map((option) => (
                  <label key={option.capacity} className={styles.storageOption}>
                    <input
                      type="radio"
                      name="storage"
                      value={option.capacity}
                      checked={selectedStorage?.capacity === option.capacity}
                      onChange={() => handleSelectStorage(option)}
                      className={styles.radioInput}
                    />
                    <span className={styles.storageCapacity}>{option.capacity}</span>
                    <span className={styles.storageDelta}>
                      {formatPriceDelta(option.priceDelta)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Colors</legend>
              <div className={styles.colorOptions}>
                {detail.colorOptions.map((option) => (
                  <label key={option.name} className={styles.colorOption}>
                    <input
                      type="radio"
                      name="color"
                      value={option.name}
                      checked={selectedColor?.name === option.name}
                      onChange={() => handleSelectColor(option)}
                      className={styles.radioInput}
                    />
                    <span
                      className={styles.swatch}
                      style={{ backgroundColor: option.hexCode }}
                      aria-hidden="true"
                    />
                    <span className={styles.visuallyHidden}>{option.name}</span>
                  </label>
                ))}
              </div>
              <p className={styles.selectedColorName} aria-live="polite">
                {selectedColor?.name ?? ''}
              </p>
            </fieldset>
          </div>

          <button
            type="button"
            className={styles.addToCart}
            disabled={!canAddToCart}
            onClick={handleAddToCart}
          >
            Añadir al carrito
          </button>
          <p className={styles.confirmation} aria-live="polite">
            {addedToCart ? 'Añadido al carrito' : ''}
          </p>
        </div>
      </div>

      <section className={styles.specs}>
        <h2 className={styles.sectionTitle}>SPECIFICATIONS</h2>
        <dl className={styles.specList}>
          <div className={styles.specRow}>
            <dt>Description</dt>
            <dd>{detail.description}</dd>
          </div>
          {SPEC_FIELDS.map(([key, label]) => (
            <div className={styles.specRow} key={key}>
              <dt>{label}</dt>
              <dd>{detail.specs[key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {detail.similarProducts.length > 0 && (
        <section className={styles.similar}>
          <h2 className={styles.sectionTitle}>SIMILAR ITEMS</h2>
          <ul className={styles.carousel}>
            {detail.similarProducts.map((phone, index) => (
              <li key={`${phone.id}-${index}`} className={styles.carouselItem}>
                <PhoneCard phone={phone} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
