import { getJson } from '../../../shared/http/httpClient';
import { Phone } from '../domain/Phone';
import { PhoneDetail } from '../domain/PhoneDetail';

/**
 * Adaptador (cliente): implementa `PhoneRepository` hablando con NUESTRO BFF
 * (`/api/phones`, `/api/phones/:id`). Sin `x-api-key`: el BFF ya devuelve
 * datos con la forma del dominio (el mapeo API externa -> dominio lo hace
 * `ApiPhoneRepository` en el servidor), así que aquí solo hay que
 * reconstruir las instancias de `Phone`/`PhoneDetail`.
 * @implements {import('../domain/PhoneRepository').PhoneRepository}
 */
export class HttpPhoneRepository {
  /**
   * @param {Object} [params]
   * @param {string} [params.baseUrl] - vacío por defecto: rutas relativas al origen de la página.
   */
  constructor({ baseUrl = '' } = {}) {
    this.baseUrl = baseUrl;
  }

  /**
   * @returns {Promise<import('../domain/Phone').Phone[]>}
   */
  async getAll() {
    const phones = await getJson({ baseUrl: this.baseUrl, path: '/api/phones' });
    return phones.map((phone) => new Phone(phone));
  }

  /**
   * @param {string} query
   * @returns {Promise<import('../domain/Phone').Phone[]>}
   */
  async search(query) {
    const phones = await getJson({
      baseUrl: this.baseUrl,
      path: '/api/phones',
      query: { search: query },
    });
    return phones.map((phone) => new Phone(phone));
  }

  /**
   * @param {string} id
   * @returns {Promise<import('../domain/PhoneDetail').PhoneDetail>}
   */
  async getById(id) {
    const detail = await getJson({ baseUrl: this.baseUrl, path: `/api/phones/${id}` });
    return new PhoneDetail(detail);
  }
}
