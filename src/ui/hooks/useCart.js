import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Hook: acceso al carrito (Cart del dominio, count, addToCart, removeFromCart)
 * expuesto por `CartProvider`. Debe usarse dentro de un `CartProvider`.
 *
 * @returns {{
 *   cart: import('../../modules/cart/domain/Cart').Cart,
 *   count: number,
 *   addToCart: (item: import('../../modules/cart/domain/CartItem').CartItem) => Promise<import('../../modules/cart/domain/Cart').Cart>,
 *   removeFromCart: (item: import('../../modules/cart/domain/CartItem').CartItem) => Promise<import('../../modules/cart/domain/Cart').Cart>,
 * }}
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
