/**
 * Flags "future" de React Router v6, compartidas por `BrowserRouter`
 * (cliente) y `StaticRouter` (servidor) para que ambos se comporten igual y
 * no emitan warnings de deprecación de cara a v7.
 */
export const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
