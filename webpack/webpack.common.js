const path = require('path');

/**
 * Config Webpack compartida (loaders y constantes comunes a cliente y
 * servidor). No es una config de Webpack en sí misma (no se pasa a
 * `--config`): `webpack.client.js` y `webpack.server.js` la importan y la
 * combinan con lo específico de cada target.
 *
 * El `localIdentName` de CSS Modules DEBE ser idéntico en cliente y servidor
 * (mismo string, mismo `context`) para que el hash de cada clase coincida en
 * los dos bundles; si no, hay mismatch de hidratación (ver CLAUDE.md).
 */

const context = path.resolve(__dirname, '..');

const resolve = {
  extensions: ['.js', '.jsx'],
};

const CSS_MODULES_LOCAL_IDENT_NAME = '[name]__[local]--[hash:base64:5]';

/**
 * `namedExport: false` mantiene el estilo `import styles from './X.module.css'`
 * (export por defecto) en vez del `namedExport: true` que trae css-loader 7
 * de fábrica (`import { clase } from ...`).
 */
const cssModules = {
  localIdentName: CSS_MODULES_LOCAL_IDENT_NAME,
  namedExport: false,
};

const babelLoaderRule = {
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: 'babel-loader',
};

module.exports = {
  context,
  resolve,
  cssModules,
  babelLoaderRule,
};
