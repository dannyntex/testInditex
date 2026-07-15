import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Cart } from '../../modules/cart/domain/Cart';
import { createClientContainer } from '../../shared/di/container';

/**
 * Adaptador de entrada (cliente): expone el estado del carrito a la UI vía
 * los casos de uso ya existentes (GetCart/AddToCart/RemoveFromCart), sin
 * lógica de dominio propia aquí — solo orquesta las llamadas y guarda el
 * resultado (un `Cart` real del dominio) en estado de React.
 */
export const CartContext = createContext(null);

/**
 * En el primer render (servidor, y la primera pasada del cliente antes de
 * hidratar) el carrito se muestra vacío a propósito, para que los dos
 * coincidan byte a byte y no haya mismatch de hidratación: `localStorage`
 * no existe en servidor. El carrito real se carga en un `useEffect`, que
 * solo corre en el cliente y solo después de montar.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 */
export function CartProvider({ children }) {
  const container = useMemo(() => createClientContainer(), []);
  const [cart, setCart] = useState(() => new Cart());

  useEffect(() => {
    let cancelled = false;
    container.getCart.execute().then((result) => {
      if (!cancelled) {
        setCart(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [container]);

  const addToCart = useCallback(
    async (item) => {
      const updated = await container.addToCart.execute(item);
      setCart(updated);
      return updated;
    },
    [container],
  );

  const removeFromCart = useCallback(
    async (item) => {
      const updated = await container.removeFromCart.execute(item);
      setCart(updated);
      return updated;
    },
    [container],
  );

  const value = useMemo(
    () => ({ cart, count: cart.items.length, addToCart, removeFromCart }),
    [cart, addToCart, removeFromCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
