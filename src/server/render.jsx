import fs from 'node:fs';
import path from 'node:path';
import { Transform } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../ui/App';
import { routerFuture } from '../ui/routerFuture';

const MANIFEST_PATH = path.resolve(__dirname, '../public/manifest.json');

/**
 * En dev el manifest puede no existir todavía en el primer instante (el
 * watcher de cliente tarda unos segundos en el primer build); se devuelve
 * un manifest vacío en vez de tirar el proceso.
 * @returns {Record<string, string>}
 */
function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Cierra las etiquetas que `renderToPipeableStream` no puede escribir tras
 * el contenido (no hay forma de "seguir escribiendo" después de `pipe()`):
 * se intercala esta transform entre React y la respuesta, y en `flush`
 * añade el cierre.
 */
function closingHtmlTags() {
  return new Transform({
    transform(chunk, _encoding, callback) {
      callback(null, chunk);
    },
    flush(callback) {
      this.push('</div></body></html>');
      callback();
    },
  });
}

/**
 * @param {Record<string, string>} manifest
 * @returns {string}
 */
function assetHead(manifest) {
  const cssHref = manifest['main.css'];
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Zara Challenge</title>
${cssHref ? `<link rel="stylesheet" href="${cssHref}" />` : ''}
</head>
<body>
<div id="root">`;
}

/**
 * Match ruta -> loader -> renderToPipeableStream -> HTML. En el hito 1b no
 * hay loaders reales (rutas vacías): el estado inicial serializado es un
 * objeto vacío. Los loaders por ruta llegan en el hito 4.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export function renderPage(req, res) {
  const manifest = readManifest();
  const initialState = {};

  return new Promise((resolve, reject) => {
    const { pipe } = renderToPipeableStream(
      <StaticRouter location={req.url} future={routerFuture}>
        <App />
      </StaticRouter>,
      {
        bootstrapScriptContent: `window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};`,
        bootstrapScripts: manifest['main.js'] ? [manifest['main.js']] : [],
        onShellReady() {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.write(assetHead(manifest));
          pipe(closingHtmlTags()).pipe(res);
        },
        onShellError(error) {
          reject(error);
        },
        onAllReady() {
          resolve();
        },
        onError(error) {
          console.error(error);
        },
      },
    );
  });
}
