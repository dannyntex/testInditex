# Zara Challenge — catálogo de móviles

> README parcial. La versión completa (instrucciones de instalación, arquitectura,
> ADRs, modos dev/prod) se documenta en el hito 9 del plan de trabajo (ver `CLAUDE.md`).

## Limitaciones conocidas

### Tamaño aparente del producto en las imágenes de la API

La caja de imagen de `PhoneCard` (listado y "Similar items" del detalle) tiene una
altura fija tomada de un token (`--size-card-image`, en `src/ui/styles/tokens.css`)
y usa `object-fit: contain` centrado, así que **todas las tarjetas miden exactamente
igual** con independencia del teléfono mostrado.

Lo que esa normalización NO puede corregir es el tamaño _aparente_ del móvil dentro
de esa caja: los assets que sirve la API traen distinto margen blanco/transparente
horneado en el propio PNG (unos modelos ocupan casi todo el encuadre, otros quedan
pequeños y centrados con mucho aire alrededor). Es una característica de los datos
de origen, no un bug de layout.

Se ha decidido **no** intentar corregirlo detectando y recortando en tiempo de
ejecución (por ejemplo con un `<canvas>` que mida el bounding box del contenido no
transparente de cada imagen y recorte el margen). Motivos:

- Rompería SSR: no hay `canvas`/`Image` de DOM en el servidor, habría que
  duplicar la lógica o forzar el recorte solo en cliente (inconsistencia
  servidor/cliente, justo lo que el proyecto evita a toda costa por hidratación).
- Las imágenes son de un dominio externo (la API del challenge): leer sus píxeles
  desde un `<canvas>` exige que ese origen sirva con cabeceras CORS adecuadas, algo
  que no controlamos y que puede cambiar sin aviso.
- No funcionaría igual con todos los fondos: un recorte por "bounding box de píxel
  no transparente" falla en cuanto el propio asset tiene fondo opaco (blanco o
  negro) en vez de transparente — no hay forma fiable de distinguir "margen" de
  "contenido" sin asumir un formato de imagen que la API no garantiza.

Conclusión: la caja se normaliza por CSS (mismo tamaño de contenedor en toda la
grid); el recorte/margen interno de cada imagen es un límite de los datos de la
API, no algo que la UI deba intentar enmascarar.
