import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../ui/styles/tokens.css';
import '../ui/styles/base.css';
import App from '../ui/App';
import { routerFuture } from '../ui/routerFuture';

/**
 * Entry point cliente: hidrata el HTML ya renderizado en servidor con el
 * estado inicial servido en `window.__INITIAL_STATE__` (serializado por
 * `server/render.jsx`: `{ pathname, data }`), sin volver a pedir los datos.
 */
const initialState = window.__INITIAL_STATE__ ?? null;

hydrateRoot(
  document.getElementById('root'),
  <BrowserRouter future={routerFuture}>
    <App initialState={initialState} />
  </BrowserRouter>,
);
