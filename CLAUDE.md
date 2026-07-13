# CLAUDE.md — Zara Challenge (catálogo de móviles)

> Contrato de trabajo. Léelo entero antes de escribir código.
> Si algo rompe las reglas de arquitectura, párate y consulta antes de seguir.

## Objetivo

App web de catálogo de teléfonos con 3 vistas: **Listado**, **Detalle**, **Carrito**.
Datos desde una API REST externa autenticada con `x-api-key`. Carrito persistente.

Se evalúa **arquitectura, decisiones justificadas, tests, accesibilidad, consola limpia e
historial de commits** — no "que funcione". Claridad estructural sobre atajos.

## Stack (cerrado — alineado con el equipo real de Inditex)

- **React** con **SSR real** renderizado desde un servidor **Express** (Node 18). Sin Next.js.
- **JavaScript** (no TypeScript). Contratos de puertos documentados con **JSDoc**.
- **Webpack** con dos configs: cliente y servidor. Dev sin minimizar; prod minimizado y concatenado.
- Estilos: **CSS Modules** (CSS plano por componente, con scope) + **variables CSS** para tokens.
  Sin SASS/preprocesador.
- Estado: **React Context API** + **custom hooks** como capa de enlace UI↔casos de uso.
- Routing: **React Router v6** compartido cliente/servidor (StaticRouter en SSR, BrowserRouter en cliente).
- Tests: **Jest** + **React Testing Library** (dominio, casos de uso, componentes) y
  **tests de servidor** con Jest + supertest (rutas BFF).
- Lint/format: **ESLint + Prettier + Husky** (pre-commit).
- Fuente: `font-family: Helvetica, Arial, sans-serif;`

## Arquitectura hexagonal — reglas NO negociables

1. **`domain/` puro**: sin React, sin `fetch`, sin `localStorage`, sin imports de `infrastructure`.
   Solo entidades, value objects y **puertos** (contratos JSDoc).
2. **`application/` (casos de uso)** depende solo del dominio (de los puertos). Recibe los puertos
   por inyección; nunca instancia adaptadores.
3. **`infrastructure/`** implementa los puertos. Aquí y solo aquí viven `fetch`, `x-api-key`, `localStorage`.
4. **UI y servidor** son adaptadores de entrada: instancian el caso de uso vía el contenedor DI y pintan/responden.
5. La dependencia siempre apunta al dominio. Import al revés = mal.

## Dos adaptadores para el mismo puerto (esto es la joya del hexágono, resáltalo)

`PhoneRepository` tiene DOS implementaciones, elegidas por entorno vía el contenedor DI:
- **`ApiPhoneRepository` (servidor)**: habla con la API externa y añade `x-api-key`. La usan el BFF
  y los loaders de SSR. La key vive SOLO aquí, nunca llega al navegador.
- **`HttpPhoneRepository` (cliente)**: habla con NUESTRO BFF (`/api/phones`). La usan los hooks del
  cliente (p. ej. la búsqueda en tiempo real). Sin key.

Mismo puerto, dos adaptadores. Documentar como ADR.

## SSR + Webpack — los gotchas que hay que respetar (zona de peligro)

- **Hashing de clases CSS Modules determinista e IDÉNTICO** en cliente y servidor (mismo
  `localIdentName`), o habrá mismatch de hidratación. Es el fallo #1.
- **Servidor**: `css-loader` con `modules: { exportOnlyLocals: true }` → devuelve solo el mapa de
  clases, no inyecta CSS. **Cliente**: `css-loader` (modules) + `MiniCssExtractPlugin` en prod /
  `style-loader` en dev. El CSS extraído del build de cliente se enlaza en el `<head>` del HTML.
- **Dos bundles Webpack**: `webpack.client.js` (target web, entry `src/client/index.jsx`,
  `hydrateRoot`) y `webpack.server.js` (target node, externals node_modules, entry del servidor).
- **Estado inicial**: antes de renderizar, el servidor ejecuta el loader de la ruta (caso de uso →
  `ApiPhoneRepository`), serializa el resultado en `window.__INITIAL_STATE__` y el cliente hidrata
  desde ahí SIN volver a pedir los datos.
- **Consola limpia**: cero warnings de hidratación. Se revisa. Un SSR con warnings puntúa peor que
  no tener SSR.
- **Carrito y localStorage**: en servidor el carrito va vacío (no hay localStorage). El badge no debe
  causar mismatch: renderizar estable en el primer paint (0/oculto hasta `mounted`) e hidratar el
  carrito desde localStorage en un `useEffect` del cliente.

## Modos dev/prod (requisito explícito del enunciado)

- **Dev**: Webpack `mode: development`, sin minimizar, con source maps (watch + nodemon). Express sirve esos assets.
- **Prod**: Webpack `mode: production`, minimizado y concatenado (hashes de contenido). `node build/server`.
- Controlado por `NODE_ENV`. Documentar los scripts en el README.

## Estructura de carpetas

```
src/
  modules/
    phones/
      domain/        Phone.js  PhoneDetail.js  Price.js  PhoneRepository.js(JSDoc puerto)
      application/   get-all/ search/ get-detail/  (cada uno con su test)
      infrastructure/ ApiPhoneRepository.js  HttpPhoneRepository.js
    cart/
      domain/        Cart.js  CartItem.js  CartRepository.js(puerto)
      application/   get/ add/ remove/ count/
      infrastructure/ LocalStorageCartRepository.js
  ui/
    App.jsx
    routes.js            # path -> { component, loader }
    context/ CartContext.jsx
    hooks/   useSearchPhones.js  useCart.js  usePhoneDetail.js
    components/          # cada componente con su Componente.module.css
    views/   PhoneList/  PhoneDetail/  Cart/
  shared/
    http/    httpClient.js
    di/      container.js     # composition root (server vs client)
    config/  env.js
  client/
    index.jsx            # hydrateRoot + BrowserRouter + estado inicial
  server/
    index.js             # app Express (Node 18)
    render.jsx           # match ruta -> loader -> renderToPipeableStream -> HTML
    bff/ phones.js       # rutas proxy que añaden x-api-key
webpack/
  webpack.common.js  webpack.client.js  webpack.server.js
```

## Dominio a modelar

- `Phone` (listado): id, brand, name, basePrice, imageUrl.
- `PhoneDetail`: + description, specs técnicas, opciones de color y de almacenamiento, `similarProducts: Phone[]`.
- `Price` (VO): precio final = base + delta almacenamiento + delta color.
- `Cart`: `items: CartItem[]`, `total()`. `CartItem`: phoneId, name, imageUrl, color, storage, price.
- Puertos: `PhoneRepository { getAll(); search(q); getById(id) }`, `CartRepository { get(); save(cart) }`.
- Casos de uso: GetAllPhones, SearchPhones, GetPhoneDetail, GetCart, AddToCart, RemoveFromCart, GetCartCount.

## Contrato de la API — VERIFICAR antes de escribir infra

Paso 0 del hito de infra: llamada real a la API externa (con la `x-api-key` del enunciado) para ver
la forma EXACTA de listado, detalle y `POST /cart`. Ajustar los tipos del dominio a la realidad; no
inventar campos de memoria. El `POST /cart` solo devuelve un contador (no persiste carrito
recuperable) → por eso la persistencia real es nuestra, en localStorage tras el puerto.

## Persistencia del carrito (Opción C)

Adaptador por defecto `LocalStorageCartRepository`, detrás del puerto `CartRepository`. Migrar a
persistencia en servidor = cambiar el adaptador, sin tocar dominio ni casos de uso. Documentar como ADR.

## Requisitos funcionales (checklist)

Listado: grid de 20 tarjetas (imagen, nombre, marca, precio base) · buscador en tiempo real
**filtrando por API** (con debounce, vía BFF) · contador de resultados · navbar con enlace a inicio e
icono de carrito con cantidad · clic → detalle.
Detalle: nombre y marca · imagen grande que cambia según color · selectores de almacenamiento y color
con precio en tiempo real · specs + precio base y variaciones · botón "Añadir al carrito" habilitado
SOLO con color y almacenamiento · sección de similares.
Carrito: imagen, nombre, specs seleccionadas y precio individual · eliminar producto · precio total ·
botón "Continuar comprando" → inicio.

## Quality gates (se revisan)

Consola sin errores ni warnings (incluida hidratación) · accesibilidad real (labels, roles, foco
visible, teclado, contraste, alt) · responsive según Figma · ESLint + Prettier limpios · tests de
dominio, casos de uso, componentes y servidor · README con instrucciones + arquitectura + ADRs ·
modos dev/prod documentados.

## Orden de trabajo (un commit con sentido por hito)

- **1a** Scaffold + tooling: estructura de carpetas, package.json (React, Express, Babel, Jest, RTL,
  ESLint/Prettier/Husky), `.nvmrc` Node 18. Sin features.
- **1b** Esqueleto SSR extremo a extremo: Webpack cliente+servidor, Express que sirve, un "hello"
  renderizado en servidor e hidratado en cliente con **consola limpia**, CSS Modules funcionando en
  ambos lados y builds dev/prod operativos. Sin lógica de negocio. (De-risking de lo difícil.)
- **2** Dominio + puertos + casos de uso con **tests primero (TDD)**. Sin UI ni red.
- **3** Infra: verificar API → `ApiPhoneRepository` + `HttpPhoneRepository` + BFF + `LocalStorageCartRepository`.
- **4** Vista Listado (SSR con loader + buscador cliente + contador + navbar).
- **5** Vista Detalle (selectores, precio dinámico, similares).
- **6** Vista Carrito (Context + persistencia + eliminar + total).
- **7** Estilos/responsive (Figma) + accesibilidad.
- **8** Tests de componentes y de servidor + repaso de cobertura.
- **9** README + ADRs + despliegue.

## Convenciones

- Commits pequeños y con sentido (conventional commits). El historial se evalúa; nada de un commit gigante.
- Un caso de uso = una carpeta = su test al lado.
- Puertos documentados con JSDoc (`@typedef`, `@callback`); adaptadores marcados `@implements` en comentario.
- Identificadores en inglés; comentarios pueden ir en español.