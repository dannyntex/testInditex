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
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
