// Targets Node (server + Jest). El bundle cliente de Webpack (hito 1b) necesitará
// su propio target de navegadores vía browserslist en webpack.client.js.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
