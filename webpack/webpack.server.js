const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { context, resolve, cssModules, babelLoaderRule } = require('./webpack.common');

/**
 * Config Webpack servidor: target node, entry el servidor Express completo,
 * `externals` para no empaquetar `node_modules` (se resuelven con `require`
 * normal en tiempo de ejecución, Node los tiene disponibles).
 *
 * El servidor no inyecta CSS (no hay `document`): `css-loader` con
 * `exportOnlyLocals: true` solo devuelve el mapa de clases. Mismo
 * `localIdentName` que el cliente para que los hashes coincidan.
 */
module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    context,
    resolve,
    target: 'node',
    entry: path.resolve(context, 'src/server/index.js'),
    externals: [nodeExternals()],
    output: {
      path: path.resolve(context, 'build/server'),
      filename: 'index.js',
      clean: true,
    },
    devtool: isProduction ? false : 'source-map',
    module: {
      rules: [
        babelLoaderRule,
        {
          test: /\.module\.css$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: { ...cssModules, exportOnlyLocals: true },
              },
            },
          ],
        },
      ],
    },
  };
};
