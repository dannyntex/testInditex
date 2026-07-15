// CommonJS a propósito (ver playwright.config.js).
const { test, expect } = require('@playwright/test');

/**
 * Camino feliz completo, planificado desde el hito 1: Listado -> buscar ->
 * Detalle -> elegir color y almacenamiento -> añadir al carrito -> Carrito
 * -> verificar línea y total -> eliminar -> carrito vacío.
 *
 * Contra la API real (sin mocks): un único test, sin asumir catálogo ni
 * nombres de producto concretos más allá de que "Samsung" tiene resultados
 * (así ha sido durante todo el desarrollo) — todo lo demás se lee de la
 * propia página.
 */
test('listado → buscar → detalle → añadir al carrito → carrito → eliminar', async ({ page }) => {
  await page.goto('/');

  const searchBox = page.getByRole('searchbox', { name: /search for a smartphone/i });
  await expect(searchBox).toBeVisible();

  // Buscar: filtra el listado y todos los resultados visibles mencionan el término.
  const initialResultsText = await page.getByText(/RESULTS/).innerText();
  await searchBox.fill('Samsung');
  await expect(page.getByText(/RESULTS/)).not.toHaveText(initialResultsText);

  const filteredResultsText = await page.getByText(/RESULTS/).innerText();
  const expectedCount = parseInt(filteredResultsText, 10);
  expect(expectedCount).toBeGreaterThan(0);

  const resultLinks = page.getByRole('main').getByRole('link');
  await expect(resultLinks).toHaveCount(expectedCount);
  for (let i = 0; i < expectedCount; i += 1) {
    await expect(resultLinks.nth(i)).toContainText(/samsung/i);
  }

  const firstResultName = await resultLinks.first().innerText();
  await resultLinks.first().click();

  // Detalle: esperar a que resuelva el fetch cliente (el <h1> pasa por un
  // marcador "Cargando…" antes del contenido real, ver PhoneDetail.jsx) y
  // comprobar que el nombre coincide con la tarjeta pulsada.
  const storageGroup = page.getByRole('group', { name: 'Storage' });
  await expect(storageGroup).toBeVisible();
  // `textContent` (no `innerText`): el <h1> se muestra en mayúsculas por CSS
  // (text-transform), pero el texto real del DOM —el que aparecerá tal cual
  // en la línea del carrito— conserva las mayúsculas/minúsculas originales.
  const detailHeading = await page.getByRole('heading', { level: 1 }).textContent();
  expect(firstResultName.toLowerCase()).toContain(detailHeading.toLowerCase());

  // Elegir almacenamiento y color (el primero de cada grupo, sin asumir nombres).
  const addToCartButton = page.getByRole('button', { name: /añadir al carrito/i });
  await expect(addToCartButton).toBeDisabled();

  // Los radios son inputs visualmente ocultos (el label visible los envuelve
  // y los tapa a propósito, ver PhoneDetail.module.css): `force` salta solo
  // la comprobación de "recibe eventos de puntero", no la interacción real.
  await storageGroup.getByRole('radio').first().check({ force: true });
  await expect(addToCartButton).toBeDisabled();

  await page
    .getByRole('group', { name: 'Colors' })
    .getByRole('radio')
    .first()
    .check({ force: true });
  await expect(addToCartButton).toBeEnabled();

  // Acotado al contenedor del <h1> (nombre + precio): "Similar items" más
  // abajo también muestra precios con el mismo patrón "N EUR".
  const priceNearHeading = page
    .getByRole('heading', { level: 1 })
    .locator('xpath=..')
    .getByText(/^\d[\d.,]* EUR$/);
  const selectedPrice = await priceNearHeading.innerText();

  await addToCartButton.click();
  await expect(page.getByText(/añadido al carrito/i)).toBeVisible();

  // Ir al carrito y verificar la línea + el total.
  await page.getByRole('link', { name: /carrito, 1 productos?/i }).click();
  await expect(page.getByRole('heading', { name: 'Carrito (1)' })).toBeVisible();

  const cartItem = page.getByRole('listitem');
  await expect(cartItem).toContainText(detailHeading);
  await expect(cartItem).toContainText(selectedPrice);

  const total = page.getByText('Total').locator('..');
  await expect(total).toContainText(selectedPrice);

  // Eliminar la línea: el carrito queda vacío.
  await page.getByRole('button', { name: /eliminar/i }).click();
  await expect(page.getByText('Tu carrito está vacío.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Carrito (0)' })).toBeVisible();
});
