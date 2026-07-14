import { Router } from 'express';
import { createServerContainer } from '../../shared/di/container';
import { HttpError } from '../../shared/http/httpClient';

/**
 * Rutas BFF de teléfonos: `GET /` (listado + `?search=`) y `GET /:id`
 * (detalle). Es un adaptador de entrada: instancia los casos de uso vía el
 * contenedor DI (que a su vez usa `ApiPhoneRepository`, la única pieza que
 * conoce la `x-api-key`) y responde; no habla con `fetch` directamente.
 *
 * Se monta en `server/index.js` como `app.use('/api/phones', createPhonesRouter())`.
 *
 * @param {Object} [params]
 * @param {ReturnType<typeof createServerContainer>} [params.container] - inyectable en tests.
 * @returns {import('express').Router}
 */
export function createPhonesRouter({ container = createServerContainer() } = {}) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const { search } = req.query;
      const phones = search
        ? await container.searchPhones.execute(search)
        : await container.getAllPhones.execute();
      res.json(phones);
    } catch (error) {
      sendUpstreamError(res, error);
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const phone = await container.getPhoneDetail.execute(req.params.id);
      res.json(phone);
    } catch (error) {
      sendUpstreamError(res, error);
    }
  });

  return router;
}

/**
 * @param {import('express').Response} res
 * @param {unknown} error
 */
function sendUpstreamError(res, error) {
  if (error instanceof HttpError) {
    res
      .status(error.status)
      .json(error.body ?? { error: 'UPSTREAM_ERROR', message: error.message });
    return;
  }

  res.status(502).json({
    error: 'BAD_GATEWAY',
    message: 'No se pudo contactar con la API externa',
  });
}
