import path from 'node:path';
import express from 'express';
import { renderPage } from './render';

/**
 * App Express (Node 18): sirve los assets del cliente y renderiza en
 * servidor para el resto de rutas. Las rutas BFF (`/api/phones`) se montan
 * a partir del hito 4, cuando el loader de la vista Listado las necesita;
 * este esqueleto (hito 1b) no tiene lógica de negocio.
 */
const app = express();

app.use('/static', express.static(path.resolve(__dirname, '../public')));

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
