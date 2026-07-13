/**
 * Puerto (contrato) para el repositorio de teléfonos.
 *
 * @typedef {Object} PhoneRepository
 * @property {function(): Promise<import('./Phone').Phone[]>} getAll
 * @property {function(string): Promise<import('./Phone').Phone[]>} search
 * @property {function(string): Promise<import('./PhoneDetail').PhoneDetail>} getById
 */

export {};
