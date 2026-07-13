/**
 * Caso de uso: buscar teléfonos por texto (marca o nombre).
 * @param {import('../../domain/PhoneRepository').PhoneRepository} phoneRepository
 */
export function createSearchPhones(phoneRepository) {
  return {
    /**
     * @param {string} query
     * @returns {Promise<import('../../domain/Phone').Phone[]>}
     */
    execute: (query) => phoneRepository.search(query),
  };
}
