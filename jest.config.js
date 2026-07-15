// Entorno por defecto: jsdom (dominio, casos de uso y componentes).
// Los tests de servidor (Express + supertest) deben forzar entorno node
// con el docblock `/** @jest-environment node */` al inicio del archivo.
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.css$': '<rootDir>/test/mocks/styleMock.js',
  },
  // /e2e/: specs de Playwright (test:e2e), no de Jest — mismo motivo por el
  // que Playwright a su vez ignora todo lo de aquí (testDir: './e2e').
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/e2e/'],
};
