/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import productDetailResponse from '../../modules/phones/infrastructure/__fixtures__/productDetailResponse.json';
import productListResponse from '../../modules/phones/infrastructure/__fixtures__/productListResponse.json';
import { createPhonesRouter } from './phones';

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
});

const buildApp = () => {
  const app = express();
  app.use('/api/phones', createPhonesRouter());
  return app;
};

describe('GET /api/phones', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PHONES_API_KEY: 'test-key',
      PHONES_API_BASE_URL: 'https://api.example.test',
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    delete global.fetch;
  });

  it('attaches the x-api-key to the upstream request and forwards the mapped list', async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, productListResponse));

    const response = await request(buildApp()).get('/api/phones');

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/products', {
      headers: { 'x-api-key': 'test-key' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(productListResponse.length);
    expect(response.body[0]).toMatchObject({ id: 'SMG-S24U', brand: 'Samsung' });
  });

  it('forwards ?search= to the upstream search query, attaching the key', async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, [productListResponse[0]]));

    const response = await request(buildApp()).get('/api/phones').query({ search: 'samsung' });

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/products?search=samsung', {
      headers: { 'x-api-key': 'test-key' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([expect.objectContaining({ id: 'SMG-S24U' })]);
  });

  it('forwards the upstream error status and body when the API rejects the key', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse(401, { error: 'UNAUTHORIZED', message: 'Invalid API key' }),
    );

    const response = await request(buildApp()).get('/api/phones');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'UNAUTHORIZED', message: 'Invalid API key' });
  });

  it('responds 502 when the upstream call fails outright (network error)', async () => {
    global.fetch.mockRejectedValue(new Error('network down'));

    const response = await request(buildApp()).get('/api/phones');

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: 'BAD_GATEWAY',
      message: 'No se pudo contactar con la API externa',
    });
  });

  it('falls back to a generic error body when the upstream error response has no JSON body', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    });

    const response = await request(buildApp()).get('/api/phones');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'UPSTREAM_ERROR', message: 'HTTP 500' });
  });
});

describe('GET /api/phones/:id', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PHONES_API_KEY: 'test-key',
      PHONES_API_BASE_URL: 'https://api.example.test',
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    delete global.fetch;
  });

  it('attaches the x-api-key and forwards the mapped detail', async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, productDetailResponse));

    const response = await request(buildApp()).get('/api/phones/SMG-S24U');

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/products/SMG-S24U', {
      headers: { 'x-api-key': 'test-key' },
    });
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('SMG-S24U');
    expect(response.body.storageOptions).toEqual([
      { capacity: '256 GB', priceDelta: -100 },
      { capacity: '512 GB', priceDelta: 0 },
      { capacity: '1 TB', priceDelta: 200 },
    ]);
  });

  it('forwards a 404 with the upstream error body for an unknown id', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse(404, { error: 'NOT-FOUND', message: 'Product not found' }),
    );

    const response = await request(buildApp()).get('/api/phones/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'NOT-FOUND', message: 'Product not found' });
  });
});
