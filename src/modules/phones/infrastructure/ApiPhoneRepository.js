import { getJson } from '../../../shared/http/httpClient';
import { toPhoneDetail, toPhoneList } from './phoneApiMapper';

/**
 * Adaptador (servidor): implementa `PhoneRepository` hablando con la API
 * externa. Añade `x-api-key`. La usan el BFF y los loaders de SSR; la key
 * vive solo aquí, nunca llega al navegador.
 * @implements {import('../domain/PhoneRepository').PhoneRepository}
 */
export class ApiPhoneRepository {
  /**
   * @param {Object} params
   * @param {string} params.baseUrl
   * @param {string} params.apiKey
   */
  constructor({ baseUrl, apiKey }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * @returns {Promise<import('../domain/Phone').Phone[]>}
   */
  async getAll() {
    const rawPhones = await getJson({
      baseUrl: this.baseUrl,
      path: '/products',
      headers: { 'x-api-key': this.apiKey },
    });
    return toPhoneList(rawPhones);
  }

  /**
   * @param {string} query
   * @returns {Promise<import('../domain/Phone').Phone[]>}
   */
  async search(query) {
    const rawPhones = await getJson({
      baseUrl: this.baseUrl,
      path: '/products',
      query: { search: query },
      headers: { 'x-api-key': this.apiKey },
    });
    return toPhoneList(rawPhones);
  }

  /**
   * @param {string} id
   * @returns {Promise<import('../domain/PhoneDetail').PhoneDetail>}
   */
  async getById(id) {
    const rawDetail = await getJson({
      baseUrl: this.baseUrl,
      path: `/products/${id}`,
      headers: { 'x-api-key': this.apiKey },
    });
    return toPhoneDetail(rawDetail);
  }
}
