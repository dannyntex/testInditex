import { getServerConfig } from '../config/env';
import { createAddToCart } from '../../modules/cart/application/add/AddToCart';
import { createGetCart } from '../../modules/cart/application/get/GetCart';
import { createGetCartCount } from '../../modules/cart/application/count/GetCartCount';
import { createRemoveFromCart } from '../../modules/cart/application/remove/RemoveFromCart';
import { LocalStorageCartRepository } from '../../modules/cart/infrastructure/LocalStorageCartRepository';
import { createGetAllPhones } from '../../modules/phones/application/get-all/GetAllPhones';
import { createGetPhoneDetail } from '../../modules/phones/application/get-detail/GetPhoneDetail';
import { createSearchPhones } from '../../modules/phones/application/search/SearchPhones';
import { ApiPhoneRepository } from '../../modules/phones/infrastructure/ApiPhoneRepository';
import { HttpPhoneRepository } from '../../modules/phones/infrastructure/HttpPhoneRepository';

/**
 * Composition root: cablea puertos -> adaptadores -> casos de uso.
 *
 * `PhoneRepository` tiene dos adaptadores según el entorno:
 * - Servidor: `ApiPhoneRepository` (habla con la API externa, añade la key).
 * - Cliente: `HttpPhoneRepository` (habla con nuestro BFF, sin key).
 *
 * `CartRepository` solo se cablea en cliente (`LocalStorageCartRepository`):
 * el carrito es persistencia de navegador (Opción C), el servidor nunca lo toca.
 */

function createPhoneUseCases(phoneRepository) {
  return {
    getAllPhones: createGetAllPhones(phoneRepository),
    searchPhones: createSearchPhones(phoneRepository),
    getPhoneDetail: createGetPhoneDetail(phoneRepository),
  };
}

function createCartUseCases(cartRepository) {
  return {
    getCart: createGetCart(cartRepository),
    addToCart: createAddToCart(cartRepository),
    removeFromCart: createRemoveFromCart(cartRepository),
    getCartCount: createGetCartCount(cartRepository),
  };
}

/**
 * @returns {ReturnType<typeof createPhoneUseCases>}
 */
export function createServerContainer() {
  const { phonesApiBaseUrl, phonesApiKey } = getServerConfig();
  const phoneRepository = new ApiPhoneRepository({
    baseUrl: phonesApiBaseUrl,
    apiKey: phonesApiKey,
  });

  return createPhoneUseCases(phoneRepository);
}

/**
 * @returns {ReturnType<typeof createPhoneUseCases> & ReturnType<typeof createCartUseCases>}
 */
export function createClientContainer() {
  const phoneRepository = new HttpPhoneRepository();
  const cartRepository = new LocalStorageCartRepository();

  return {
    ...createPhoneUseCases(phoneRepository),
    ...createCartUseCases(cartRepository),
  };
}
