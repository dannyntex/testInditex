/**
 * Caso de uso: obtener el detalle de un teléfono por id.
 * @param {import('../../domain/PhoneRepository').PhoneRepository} phoneRepository
 */
export function createGetPhoneDetail(phoneRepository) {
  return {
    /**
     * @param {string} id
     * @returns {Promise<import('../../domain/PhoneDetail').PhoneDetail>}
     */
    execute: (id) => phoneRepository.getById(id),
  };
}
