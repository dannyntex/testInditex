# Zara Challenge — catálogo de móviles

**Desplegado en: https://testinditex.onrender.com/** (Render, plan
gratuito — primera petición tras un rato inactivo puede tardar, ver
[Despliegue](#despliegue)).

App de catálogo de teléfonos (Listado, Detalle, Carrito) con SSR real sobre
Express + React, arquitectura hexagonal y persistencia de carrito en cliente.
Datos desde una API REST externa autenticada con `x-api-key` (la key nunca
llega al navegador: ver [ADR-001](#adr-001-bff-con-express)).

## Índice

- [Cómo ejecutar](#cómo-ejecutar)
- [Arquitectura hexagonal](#arquitectura-hexagonal)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Cómo se cumplen los requisitos del enunciado](#cómo-se-cumplen-los-requisitos-del-enunciado)
- [Despliegue](#despliegue)
- [ADRs](#adrs-architecture-decision-records)
- [Limitaciones conocidas](#limitaciones-conocidas)

## Cómo ejecutar

Requiere **Node 18** (`.nvmrc` en la raíz): `nvm use`.

```bash
npm install
cp .env.example .env.local   # rellenar PHONES_API_KEY y PHONES_API_BASE_URL
```

`PHONES_API_KEY` y `PHONES_API_BASE_URL` son **las dos obligatorias**:
`src/shared/config/env.js` revienta explícitamente al arrancar si falta
cualquiera de las dos, en vez de arrancar a medias con un valor por defecto
oculto en el código (no hay ningún hardcodeado — ni la key ni la URL).

### Desarrollo

```bash
npm run dev
```

Levanta **dos procesos en paralelo** (`concurrently`):

- `dev:client` — Webpack `--mode development --watch` sobre
  `webpack/webpack.client.js`: bundle sin minimizar, con source maps, CSS
  inyectado por `style-loader` (recarga entera de página al cambiar, no HMR).
- `dev:server` — `nodemon` vigila `src/**/*.{js,jsx}`; en cada cambio
  reconstruye el bundle de servidor (`webpack.server.js --mode development`)
  y relanza `node build/server/index.js`.

Servidor en `http://localhost:3000` (o `PORT` si se define).

### Producción

```bash
npm run build   # build:client + build:server, ambos --mode production
npm start        # NODE_ENV=production node build/server/index.js
```

En prod, el bundle de cliente sale minimizado y con el CSS extraído a fichero
(`MiniCssExtractPlugin`, con `contenthash`) en vez de inyectado por JS;
`WebpackManifestPlugin` escribe `build/public/manifest.json` con los nombres
reales de los assets, y `render.jsx` lo lee para enlazar el CSS en el
`<head>` del HTML antes de que cargue ningún JS.

### Tests

```bash
npm test          # Jest: dominio, casos de uso, infraestructura, servidor/BFF y componentes (RTL)
npm run test:e2e  # Playwright: camino feliz completo, contra la app real (ver ADR-012)
```

`test:e2e` arranca `npm run dev` automáticamente si no hay ya un servidor
escuchando en el puerto configurado (`playwright.config.js`, `webServer`).

### Lint y formato

```bash
npm run lint            # ESLint
npm run format:check    # Prettier (solo comprobar)
npm run format           # Prettier (reescribe)
```

Husky + lint-staged corren `eslint --fix`/`prettier --write` en pre-commit.

## Arquitectura hexagonal

```
UI (React) ──┐
             ├──▶ casos de uso (application/) ──▶ puertos (domain/)
Servidor ────┘                                         ▲
                                                        │
                                    adaptadores (infrastructure/)
```

- **`domain/`** es puro: sin React, sin `fetch`, sin `localStorage`, sin
  imports de `infrastructure/`. Solo entidades (`Phone`, `PhoneDetail`,
  `Cart`, `CartItem`), value objects (`Price`) y **puertos** — contratos
  documentados solo con JSDoc (`PhoneRepository`, `CartRepository`), nunca
  con una clase o implementación.
- **`application/`** (casos de uso: `GetAllPhones`, `SearchPhones`,
  `GetPhoneDetail`, `AddToCart`, `RemoveFromCart`, `GetCart`,
  `GetCartCount`) depende solo de los puertos. Recibe el repositorio por
  inyección (factory `createXxx(repository)`); nunca instancia un adaptador
  él mismo.
- **`infrastructure/`** implementa los puertos. Aquí y solo aquí viven
  `fetch`, `x-api-key` y `localStorage`. **`PhoneRepository` tiene dos
  adaptadores** — ver [ADR-002](#adr-002-dos-adaptadores-para-un-puerto).
- **UI (`src/ui/`) y servidor (`src/server/`)** son adaptadores de
  **entrada**: instancian los casos de uso vía el contenedor DI
  (`src/shared/di/container.js`, el _composition root_) y pintan/responden.
  La UI nunca toca un adaptador de `infrastructure/` directamente.

La dependencia siempre apunta hacia el dominio; nunca al revés.

### El contenedor DI: dos composition roots

`container.js` expone `createServerContainer()` y `createClientContainer()`.
Cada uno cablea el mismo conjunto de casos de uso con adaptadores distintos:

|                   | Servidor (`createServerContainer`)                 | Cliente (`createClientContainer`)            |
| ----------------- | -------------------------------------------------- | -------------------------------------------- |
| `PhoneRepository` | `ApiPhoneRepository` (API externa + `x-api-key`)   | `HttpPhoneRepository` (nuestro BFF, sin key) |
| `CartRepository`  | _(no se cablea: el carrito no existe en servidor)_ | `LocalStorageCartRepository`                 |

### Flujo de una petición (Listado, ejemplo completo)

1. **Servidor, SSR** (`GET /`): `server/render.jsx` matchea la ruta,
   ejecuta su `loader` (`routes.js`) con el contenedor de **servidor**:
   `container.getAllPhones.execute()` → `ApiPhoneRepository.getAll()` →
   `fetch` a la API externa con `x-api-key` → `phoneApiMapper.toPhoneList`
   (API → dominio) → `Phone[]`.
2. El resultado se serializa como `{ pathname, data }` en
   `window.__INITIAL_STATE__` (ver [ADR-009](#adr-009-estado-inicial-cacheado-por-ruta))
   y React renderiza el HTML completo (`renderToPipeableStream`).
3. **Cliente, hidratación**: `client/index.jsx` llama `hydrateRoot` con ese
   mismo estado inicial — **sin volver a pedir los datos**.
4. **Cliente, interacción** (el usuario escribe en el buscador):
   `useSearchPhones` (tras el debounce) usa el contenedor de **cliente**:
   `container.searchPhones.execute(q)` → `HttpPhoneRepository.search(q)` →
   `fetch('/api/phones?search=…')` a **nuestro propio origen** (sin key) →
   el BFF (`server/bff/phones.js`) recibe la petición, instancia el
   contenedor de servidor y repite el paso 1 (con la key, server-side) →
   responde JSON ya mapeado a dominio.

El mismo puerto (`PhoneRepository`) y los mismos casos de uso sirven ambos
caminos; solo cambia el adaptador.

## Estructura de carpetas

```
src/
  modules/
    phones/
      domain/          Phone.js  PhoneDetail.js  Price.js  PhoneRepository.js (puerto)
      application/      get-all/  search/  get-detail/  (cada uno con su test)
      infrastructure/   ApiPhoneRepository.js  HttpPhoneRepository.js  phoneApiMapper.js
    cart/
      domain/          Cart.js  CartItem.js  CartRepository.js (puerto)
      application/      add/  remove/  get/  count/
      infrastructure/   LocalStorageCartRepository.js
  shared/
    http/     httpClient.js       # fetch + parseo JSON + HttpError, compartido servidor/cliente
    di/       container.js        # composition root (servidor vs cliente)
    config/   env.js              # única puerta de entrada a process.env
  ui/
    App.jsx                       # CartProvider + InitialStateProvider + Navbar + <Routes>
    routes.js                     # path -> { Component, loader }
    routerFuture.js                # flags v7 de React Router, compartidas Browser/StaticRouter
    context/  CartContext.jsx  InitialStateContext.jsx
    hooks/    useCart.js  useSearchPhones.js  usePhoneDetail.js  useRouteFocus.js
    components/  Navbar/  PhoneCard/          # cada uno con su Componente.module.css
    views/       PhoneList/  PhoneDetail/  Cart/
    styles/   tokens.css (variables CSS, :root)  base.css (reset + estilos base)
  client/
    index.jsx                     # hydrateRoot + BrowserRouter + estado inicial
  server/
    index.js                      # app Express (Node 18)
    render.jsx                    # match ruta -> loader -> renderToPipeableStream -> HTML
    bff/  phones.js               # proxy que añade x-api-key
webpack/
  webpack.common.js  webpack.client.js  webpack.server.js
e2e/
  happy-path.spec.js              # Playwright, camino feliz completo
```

## Cómo se cumplen los requisitos del enunciado

- **SSR real, no un SPA con `dangerouslySetInnerHTML`**: Express +
  `renderToPipeableStream` + `hydrateRoot`, con el mismo árbol de componentes
  y el mismo hash de clases CSS Modules en servidor y cliente (mismo
  `localIdentName` en `webpack.common.js`) — sin eso, mismatch de
  hidratación garantizado.
- **Modos dev/prod reales, no solo una bandera**: dos configs de Webpack
  distintas (`--mode development|production`), no la misma con un `if`
  suelto — ver [Cómo ejecutar](#cómo-ejecutar).
- **Buscador filtrado por la API, no un `.filter()` en cliente**: cada
  tecleo (tras 300ms de debounce) dispara `SearchPhones` contra el BFF, que
  reenvía `?search=` a la API externa con la key. Verificado en
  `PhoneList.test.jsx` (no llama antes del debounce) y en
  `server/bff/phones.test.js` (reenvía el query param con la key).
- **Persistencia del carrito**: `LocalStorageCartRepository` detrás del
  puerto `CartRepository` — ver [ADR-003](#adr-003-persistencia-tras-el-puerto-cartrepository).
- **`x-api-key` nunca en el navegador**: solo existe dentro de
  `ApiPhoneRepository`, instanciado únicamente en el contenedor de
  **servidor** — ver [ADR-001](#adr-001-bff-con-express).

## Despliegue

El servidor es un proceso Express de larga duración (no serverless): escucha
en `process.env.PORT` (`src/server/index.js`) y necesita `PHONES_API_KEY` y
`PHONES_API_BASE_URL` en el entorno — ninguna de las dos tiene valor por
defecto en el código (revienta al arrancar si falta cualquiera, ver
[Cómo ejecutar](#cómo-ejecutar)).

```bash
npm ci
npm run build
PHONES_API_KEY=... PHONES_API_BASE_URL=... npm start
```

Verificado desde cero (clon limpio, sin `node_modules` ni `.env.local`):
`npm ci && npm run build` completa sin tocar ninguna variable de entorno
(el build es solo Webpack; las env vars solo hacen falta en runtime), y el
servidor construido arranca y responde con las dos variables puestas, y
revienta explícitamente (antes de `app.listen`, en el primer require del
router del BFF) si falta cualquiera de las dos.

### Render (Web Service, Node)

No hay nada específico de Render en el código — cualquier host que ejecute
un proceso Node 18 persistente sirve (Railway, Fly.io, una VM propia...) —
pero la configuración concreta para Render es:

| Campo         | Valor                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Tipo          | Web Service                                                                                    |
| Runtime       | Node                                                                                           |
| Build Command | `npm ci && npm run build`                                                                      |
| Start Command | `npm start`                                                                                    |
| Node version  | 18 (ver `.nvmrc` / `engines.node` en `package.json`)                                           |
| Env vars      | `PHONES_API_KEY`, `PHONES_API_BASE_URL` (Render inyecta `PORT` solo, no hace falta declararla) |

**Cold start del plan gratuito**: los Web Services gratuitos de Render se
duermen tras un período de inactividad; la primera petición después de eso
tarda en responder (arranque en frío del contenedor, del orden de
decenas de segundos) mientras el servicio despierta. No es un fallo de la
app — es la política del plan free — pero conviene saberlo al probar la
URL desplegada por primera vez tras un rato sin tráfico, y al interpretar
un timeout inicial en el test E2E si apunta contra esa URL.

### Desplegado

**https://testinditex.onrender.com/** — Web Service en Render, configurado
como arriba. Verificado con humo tras el despliegue: `/` (SSR con las 24
tarjetas reales y `x-api-key` ausente del HTML, comprobado a mano), `/cart`,
`/phone/:id` y el BFF `/api/phones` responden `200` con datos reales;
`/favicon.ico` responde `204` (evita el catch-all de SSR, ver
`src/server/index.js`).

### Credenciales: verificación

`.env` y `.env.local` están en `.gitignore` (solo `.env.example`, sin
valores reales, está versionado). Comprobado además contra todo el
historial real del repositorio, no solo el estado actual:
`git log -p --all` no contiene la API key en ningún commit ni en ninguna
rama — nunca se llegó a comitear un `.env.local` real.

## ADRs (Architecture Decision Records)

Formato: contexto → decisión → consecuencias.

### ADR-001: BFF con Express

**Contexto.** El enunciado pide un backend Node 18 real, y la `x-api-key`
de la API externa no puede llegar al navegador bajo ningún concepto.

**Decisión.** El mismo servidor Express que hace SSR expone
`/api/phones` (BFF): un proxy que instancia el contenedor de _servidor_
(`ApiPhoneRepository`, la única pieza que conoce la key) y reenvía la
respuesta ya mapeada a dominio. El cliente solo habla con `/api/phones` de
**nuestro propio origen**, nunca con la API externa directamente.

**Consecuencias.** El Network tab del navegador nunca muestra la key
(inspeccionable, verificado). Hay un salto de red extra (cliente → nuestro
servidor → API externa) en cada búsqueda. Un solo proceso Express cubre
SSR + BFF, lo que simplifica el despliegue (un solo servicio, no dos).

### ADR-002: Dos adaptadores para un puerto

**Contexto.** Servidor y cliente necesitan los mismos datos de teléfonos,
pero con reglas de acceso distintas: el servidor puede (y debe) usar la
key; el cliente no debe verla nunca.

**Decisión.** Un único puerto `PhoneRepository` (`getAll`/`search`/`getById`),
dos adaptadores: `ApiPhoneRepository` (servidor: habla con la API externa,
añade `x-api-key`) y `HttpPhoneRepository` (cliente: habla con nuestro BFF,
sin key). El contenedor DI elige uno u otro según el entorno.

**Consecuencias.** Los casos de uso (`GetAllPhones`, `SearchPhones`,
`GetPhoneDetail`) son 100% agnósticos de dónde corren — el mismo código de
aplicación sirve al loader de SSR y al hook de búsqueda en cliente. Cada
adaptador se testea por separado, mockeando solo `fetch`
(`ApiPhoneRepository.test.js`, `HttpPhoneRepository.test.js`).

### ADR-003: Persistencia tras el puerto CartRepository

**Contexto.** El enunciado exige persistencia del carrito, pero el
`POST /cart` de la API externa solo devuelve un contador — no hay forma de
recuperar un carrito ya guardado desde esa API. La persistencia real tiene
que ser nuestra.

**Decisión.** Adaptador por defecto `LocalStorageCartRepository` detrás del
puerto `CartRepository`; el dominio (`Cart`, `CartItem`) y los casos de uso
no saben que es `localStorage`.

**Consecuencias.** Migrar a persistencia de servidor (o sincronizar entre
dispositivos) es cambiar el adaptador, sin tocar dominio ni aplicación. En
SSR el repositorio no puede acceder a `window`, así que el carrito de
servidor va vacío a propósito, y el cliente lo hidrata en un `useEffect`
tras montar — evita mismatch de hidratación en el badge del navbar.

### ADR-004: Price con priceDelta normalizado en el mapper

**Contexto.** La API externa expresa cada opción de almacenamiento como un
precio **absoluto** (256GB=1229€, 512GB=1329€...), no como una variación
sobre el precio base. Las opciones de color no llevan precio propio.

**Decisión.** `phoneApiMapper.toPhoneDetail` normaliza al mapear:
`priceDelta = storage.price - basePrice`. El dominio (`Price`, value
object) expresa siempre `basePrice + storageDelta + colorDelta`, con
`colorDelta` en 0 mientras la API no ofrezca variación de precio por color.

**Consecuencias.** Si el color llegara a afectar al precio en el futuro,
solo hay que tocar el mapper, no `Price.js`. El signo importa de verdad
(256GB puede costar _menos_ que el precio base) y el cálculo no lo recorta
a 0 ni antepone un `+` a ciegas (`formatPriceDelta`, `PhoneDetail.jsx`).

### ADR-005: Duplicados en el carrito

**Contexto.** El diseño de Figma no tiene ningún control de cantidad
(`+`/`-`) en la línea del carrito.

**Decisión.** `Cart.addItem` nunca fusiona líneas iguales. `CartItem`
genera su propio `id` (o reutiliza el ya persistido, si viene de
`localStorage`), y `Cart.removeItem` compara por ese `id`, nunca por
teléfono/color/almacenamiento.

**Consecuencias.** Añadir la misma variante dos veces crea dos líneas
visibles a propósito — es el comportamiento esperado, no un bug. Eliminar
una línea nunca borra de más un duplicado exacto (verificado en
`Cart.test.jsx`: con 2 líneas idénticas, eliminar una deja exactamente 1,
no 0 ni 2). Si en el futuro se añade control de cantidad, hay que decidir
explícitamente fusionar o no — hoy no hay fusión silenciosa.

### ADR-006: Botón "Pay" sin funcionalidad

**Contexto.** El diseño de Figma incluye un botón "Pay" en el footer del
carrito; el enunciado no pide checkout ni pago real.

**Decisión.** Se renderiza el botón (fidelidad visual al diseño) pero
permanece `disabled` siempre — no dispara ninguna acción ni caso de uso.

**Consecuencias.** No hay lógica de pago que mantener, testear ni asegurar.
El elemento del diseño está presente, y su estado `disabled` comunica sin
ambigüedad que no hace nada. Si el alcance creciera, ya hay hueco reservado
en el layout y el footer ya está preparado (ver hito de responsive).

### ADR-007: Variación de precio en los selectores

**Contexto.** El enunciado pide selectores de almacenamiento y color "con
precio en tiempo real"; el prototipo de Figma, al ser estático, no puede
mostrar ese recálculo como interacción, solo estados fijos.

**Decisión.** Se implementa el recálculo en tiempo real igualmente,
siguiendo el enunciado por encima de lo que el diseño estático puede o no
"mostrar".

**Consecuencias.** Sin inconsistencia entre lo pedido y lo entregado. El
precio mostrado sale siempre de `Price.final()` (el value object del
dominio) — nunca se recalcula a mano dentro del componente.

### ADR-008: Estado parcial de selección

**Contexto.** Ni el enunciado ni el diseño especifican qué debe pasar con
el precio cuando el usuario ya eligió almacenamiento pero todavía no color
— un paso intermedio que ninguno de los dos cubre explícitamente.

**Decisión.** El precio se actualiza en tiempo real en cuanto hay
almacenamiento elegido, **sin esperar también** a que haya color —
justificado porque `colorDelta` es siempre 0 en la API real (ADR-004), así
que esperar al color no cambiaría el precio mostrado, solo retrasaría el
feedback. El botón "Añadir al carrito", en cambio, sí exige **ambos**
(storage y color), porque ahí sí hace falta la combinación completa para
construir la línea del carrito (`CartItem` necesita las dos).

**Consecuencias.** Mejor feedback percibido: el precio reacciona al primer
clic, no al segundo. Si el color llegara a tener su propio delta de precio,
esta decisión habría que revisarla (¿mostrar precio final antes de tener
ambos, o un rango?).

### ADR-009: estado inicial cacheado por ruta

**Contexto.** Bug real encontrado y corregido (hito 8):
`window.__INITIAL_STATE__` era un único valor global, repartido a **todas**
las rutas por igual desde `App`. Si la carga completa (SSR) era de
`/cart` o `/phone/:id` y luego se navegaba del lado cliente a `/`,
`PhoneList` recibía datos con la forma de otra vista —
`phones.map is not a function` en el caso de `/phone/:id`, o (en el caso
de `/cart`, `data: null`) el listado se quedaba vacío en silencio para
siempre, sin refetch nunca.

**Decisión.** El servidor serializa `{ pathname, data }` en vez de solo
`data`. Un único mecanismo compartido (`useInitialRouteData`, dentro de
`InitialStateContext`) lo expone a cualquier hook, pero **solo** si el
`pathname` coincide con la ruta que se está pintando ahora mismo; si no,
`null`, y el hook decide si pedir sus propios datos.

**Consecuencias.** Ninguna vista futura puede repetir este fallo — antes
`usePhoneDetail` se protegía a mano comparando `initialDetail.id === id`;
ahora la comparación de `pathname` en el mecanismo compartido ya cubre ese
caso (y cualquier otro). Un hook nuevo que consuma estado inicial de
servidor solo tiene que llamar a `useInitialRouteData()`, no reinventar la
comprobación. Test de regresión: `App.test.jsx`.

### ADR-010: Breakpoint 1120px derivado del contenido, no del diseño

**Contexto.** El archivo de diseño (Pencil) solo tiene dos frames reales:
Desktop (1920) y Mobile (393) — no existe ningún frame "Tablet". El único
breakpoint del proyecto (834px, heredado de un token `--breakpoint-tablet`
de una sincronización anterior con Figma) resultó insuficiente al probarlo:
justo a esa anchura, el grid del Listado caía a 1 columna con gutters
enormes y vacíos, y el footer del Carrito desbordaba de verdad (el precio
se partía en 2 líneas y el botón "Pagar" quedaba fuera de la pantalla).

**Decisión.** Se añade un segundo breakpoint, `--breakpoint-wide` (1120px),
calculado **probando en el navegador** hasta que el contenido (grid
multi-columna, footer agrupado con los anchos fijos medidos en el diseño)
deja de romperse — no sale de ningún frame de Figma/Pencil. 834px se
mantiene para lo que ya encajaba bien ahí (nav, columnas del Detalle).

**Consecuencias.** El criterio para futuros breakpoints en este proyecto es
"cabe el contenido sin romperse", no "hay un frame a ese ancho" (no lo
había ni para 834). Cualquier layout nuevo que necesite más espacio debe
medirse en el navegador, documentando el cálculo, igual que aquí.

### ADR-011: Límite de los assets de la API

**Contexto.** Cada imagen de producto que sirve la API externa trae un
margen blanco/transparente distinto horneado en el propio PNG — unos
modelos casi llenan el encuadre, otros quedan pequeños y centrados con
mucho aire alrededor. Visible en el grid como tarjetas de tamaño idéntico
pero con el teléfono "aparente" de tamaños muy distintos entre sí.

**Decisión.** Normalizar solo el **contenedor** (`--size-card-image` fijo +
`object-fit: contain`), no el contenido de la imagen. Se rechaza
explícitamente recortar en tiempo de ejecución (`<canvas>` + bounding box
de píxeles no transparentes).

**Consecuencias.** Por qué se rechazó el canvas-cropping: rompería SSR (no
hay `canvas`/`Image` de DOM en el servidor); las imágenes son de un dominio
externo y leer sus píxeles vía `canvas` exige cabeceras CORS que no
controlamos; y el propio criterio de recorte (bounding box de píxel no
transparente) falla en cuanto un asset tiene fondo opaco en vez de
transparente. El tamaño aparente distinto queda documentado como límite de
los datos de origen, no como un bug de layout — ver
[Limitaciones conocidas](#limitaciones-conocidas).

### ADR-012: E2E contra la API real

**Contexto.** El hito 8 pedía un test E2E (Playwright) del camino feliz
completo. Jest+RTL ya cubren mocks de `fetch` a nivel de componente/hook;
Jest+supertest ya cubre el BFF con `fetch` mockeado.

**Decisión.** El test E2E corre contra la app real completa (cliente +
servidor + API externa de la prueba técnica), sin mockear nada en esa
capa — es el único nivel que verifica la integración real de principio a
fin.

**Consecuencias.** Qué gana: detecta problemas que ningún mock puede
detectar (cambios de contrato de la API real, latencia real, comportamiento
real del servidor Express completo). Qué arriesga: el test depende de que
la API de terceros esté arriba y de que exista al menos un resultado para
"Samsung" (documentado en el propio test, `e2e/happy-path.spec.js`) — es
una fuente de _flakiness_ fuera de nuestro control, mitigada evitando
asumir catálogo o nombres de producto concretos más allá de esa única
búsqueda (el resto se lee de la propia página en cada ejecución).

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
