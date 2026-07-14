import { Phone } from '../domain/Phone';
import { PhoneDetail } from '../domain/PhoneDetail';

/**
 * Mapeo puro API externa -> dominio. Es el único sitio que sabe que la API
 * expresa `storageOptions[].price` como precio absoluto: el dominio solo
 * conoce `priceDelta` (ver decisión documentada en `Price.js`, hito 2). El
 * color no lleva precio en la API real, así que no se fabrica ninguno aquí.
 */

/**
 * @param {Object} rawPhone - forma `ProductListEntity` de la API.
 * @returns {Phone}
 */
export function toPhone(rawPhone) {
  return new Phone({
    id: rawPhone.id,
    brand: rawPhone.brand,
    name: rawPhone.name,
    basePrice: rawPhone.basePrice,
    imageUrl: rawPhone.imageUrl,
  });
}

/**
 * @param {Object[]} rawPhones
 * @returns {Phone[]}
 */
export function toPhoneList(rawPhones) {
  return rawPhones.map(toPhone);
}

/**
 * @param {Object} rawDetail - forma `ProductEntity` de la API.
 * @returns {PhoneDetail}
 */
export function toPhoneDetail(rawDetail) {
  return new PhoneDetail({
    id: rawDetail.id,
    brand: rawDetail.brand,
    name: rawDetail.name,
    basePrice: rawDetail.basePrice,
    // El detalle de la API no trae un `imageUrl` propio (a diferencia del
    // listado): la imagen depende del color. Se usa la del primer color como
    // imagen inicial; la vista Detalle la cambiará según el color elegido.
    imageUrl: rawDetail.colorOptions?.[0]?.imageUrl,
    description: rawDetail.description,
    rating: rawDetail.rating,
    specs: rawDetail.specs,
    colorOptions: rawDetail.colorOptions.map((color) => ({
      name: color.name,
      hexCode: color.hexCode,
      imageUrl: color.imageUrl,
    })),
    storageOptions: rawDetail.storageOptions.map((storage) => ({
      capacity: storage.capacity,
      priceDelta: storage.price - rawDetail.basePrice,
    })),
    similarProducts: toPhoneList(rawDetail.similarProducts),
  });
}
