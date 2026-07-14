import { getServerConfig } from '../config/env';
import { createGetAllPhones } from '../../modules/phones/application/get-all/GetAllPhones';
import { createGetPhoneDetail } from '../../modules/phones/application/get-detail/GetPhoneDetail';
import { createSearchPhones } from '../../modules/phones/application/search/SearchPhones';
import { ApiPhoneRepository } from '../../modules/phones/infrastructure/ApiPhoneRepository';
import { HttpPhoneRepository } from '../../modules/phones/infrastructure/HttpPhoneRepository';

/**
 * Composition root: cablea puertos -> adaptadores -> casos de uso. Mismo
 * puerto (`PhoneRepository`), dos adaptadores según el entorno:
 * - Servidor: `ApiPhoneRepository` (habla con la API externa, añade la key).
 * - Cliente: `HttpPhoneRepository` (habla con nuestro BFF, sin key).
 */

function createPhoneUseCases(phoneRepository) {
  return {
    getAllPhones: createGetAllPhones(phoneRepository),
    searchPhones: createSearchPhones(phoneRepository),
    getPhoneDetail: createGetPhoneDetail(phoneRepository),
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
 * @returns {ReturnType<typeof createPhoneUseCases>}
 */
export function createClientContainer() {
  const phoneRepository = new HttpPhoneRepository();

  return createPhoneUseCases(phoneRepository);
}
