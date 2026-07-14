const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { context, resolve, cssModules, babelLoaderRule } = require('./webpack.common');

/**
 * Config Webpack cliente: target web, entry `src/client/index.jsx`,
 * `hydrateRoot`. Dev: sin minimizar, con source maps, CSS inyectado por
 * `style-loader`. Prod: minimizado, CSS extraído a fichero por
 * `MiniCssExtractPlugin` (para que `render.jsx` pueda enlazarlo en el
 * `<head>` desde el primer HTML, sin esperar a que cargue el JS).
 *
 * `WebpackManifestPlugin` escribe `build/public/manifest.json` para que el
 * servidor sepa el nombre real de los assets (con `contenthash` en prod).
 */
module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    context,
    resolve,
    target: 'web',
    entry: { main: path.resolve(context, 'src/client/index.jsx') },
    output: {
      path: path.resolve(context, 'build/public'),
      publicPath: '/static/',
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      clean: true,
    },
    devtool: isProduction ? false : 'source-map',
    module: {
      rules: [
        babelLoaderRule,
        {
          test: /\.module\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: { modules: cssModules },
            },
          ],
        },
      ],
    },
    plugins: [
      ...(isProduction
        ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' })]
        : []),
      new WebpackManifestPlugin({ publicPath: '/static/' }),
    ],
  };
};
