/**
 * Caso de uso: obtener el listado completo de teléfonos.
 * @param {import('../../domain/PhoneRepository').PhoneRepository} phoneRepository
 */
export function createGetAllPhones(phoneRepository) {
  return {
    /**
     * @returns {Promise<import('../../domain/Phone').Phone[]>}
     */
    execute: () => phoneRepository.getAll(),
  };
}
