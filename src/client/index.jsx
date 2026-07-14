import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '../ui/App';
import { routerFuture } from '../ui/routerFuture';

/**
 * Entry point cliente: hidrata el HTML ya renderizado en servidor. El
 * estado inicial (`window.__INITIAL_STATE__`, serializado por
 * `server/render.jsx`) se consumirá a partir del hito 4, cuando existan
 * loaders reales; de momento no hay datos que hidratar.
 */
hydrateRoot(
  document.getElementById('root'),
  <BrowserRouter future={routerFuture}>
    <App />
  </BrowserRouter>,
);
