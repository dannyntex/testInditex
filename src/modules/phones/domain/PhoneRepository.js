/**
 * Puerto: contrato que debe cumplir cualquier adaptador de acceso a teléfonos,
 * hable con la API externa (servidor) o con nuestro BFF (cliente).
 *
 * @typedef {Object} PhoneRepository
 * @property {GetAllPhonesFn} getAll
 * @property {SearchPhonesFn} search
 * @property {GetPhoneByIdFn} getById
 */

/**
 * @callback GetAllPhonesFn
 * @returns {Promise<import('./Phone').Phone[]>}
 */

/**
 * @callback SearchPhonesFn
 * @param {string} query
 * @returns {Promise<import('./Phone').Phone[]>}
 */

/**
 * @callback GetPhoneByIdFn
 * @param {string} id
 * @returns {Promise<import('./PhoneDetail').PhoneDetail>}
 */

export {};
