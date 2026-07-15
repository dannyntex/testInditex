import { PhoneList } from './views/PhoneList/PhoneList';

/**
 * Mapa de rutas: path -> { Component, loader }.
 * Compartido entre cliente (BrowserRouter) y servidor (StaticRouter). El
 * `loader` lo ejecuta solo el servidor (recibe el contenedor DI de servidor,
 * que usa `ApiPhoneRepository`) antes de renderizar; el resultado se
 * serializa en `window.__INITIAL_STATE__` y el cliente hidrata desde ahí.
 */
export const routes = [
  {
    path: '/',
    Component: PhoneList,
    loader: (container) => container.getAllPhones.execute(),
  },
];
