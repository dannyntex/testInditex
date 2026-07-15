import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import { renderPage } from './render';
import { createPhonesRouter } from './bff/phones';

// Carga `.env.local` (gitignored) en `process.env` antes de instanciar el
// contenedor DI de servidor (más abajo, al montar el BFF): sin esto, solo
// funcionaba si el proceso ya traía las variables de otro sitio (shell,
// CI...). No pisa variables ya definidas en el entorno real (p.ej. despliegue).
dotenv.config({ path: path.resolve(__dirname, '../../.env.local'), quiet: true });

/**
 * App Express (Node 18): sirve los assets del cliente, expone el BFF de
 * teléfonos (proxy que añade `x-api-key`, consumido por los hooks de
 * cliente) y renderiza en servidor para el resto de rutas.
 */
const app = express();

app.use('/static', express.static(path.resolve(__dirname, '../public')));

// El navegador pide este recurso en toda navegación; sin esto cae en el
// catch-all de SSR y React Router avisa de "No routes matched" en consola.
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/phones', createPhonesRouter());

app.get('*', async (req, res) => {
  try {
    await renderPage(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
