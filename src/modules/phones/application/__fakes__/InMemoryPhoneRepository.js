/**
 * Fake in-memory del puerto `PhoneRepository`, para tests de casos de uso.
 * No es un mock de métodos sueltos: implementa el contrato real del puerto.
 * @implements {import('../../domain/PhoneRepository').PhoneRepository}
 */
export class InMemoryPhoneRepository {
  /**
   * @param {import('../../domain/Phone').Phone[]} phones
   * @param {Map<string, import('../../domain/PhoneDetail').PhoneDetail>} [detailsById]
   */
  constructor(phones = [], detailsById = new Map()) {
    this.phones = phones;
    this.detailsById = detailsById;
  }

  async getAll() {
    return this.phones;
  }

  async search(query) {
    const normalizedQuery = query.toLowerCase();
    return this.phones.filter(
      (phone) =>
        phone.name.toLowerCase().includes(normalizedQuery) ||
        phone.brand.toLowerCase().includes(normalizedQuery),
    );
  }

  async getById(id) {
    const detail = this.detailsById.get(id);
    if (!detail) {
      throw new Error(`Phone not found: ${id}`);
    }
    return detail;
  }
}
