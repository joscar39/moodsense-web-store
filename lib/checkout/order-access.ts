/**
 * Nombre de la cookie que prueba que este navegador creó el pedido `orderId`.
 *
 * Para qué: la página de confirmación muestra datos del pedido; solo se ve si
 * el navegador tiene esta cookie (la pone POST /api/checkout/manual) o si el
 * usuario con sesión es el dueño del pedido. Así nadie ve pedidos ajenos
 * aunque conozca su enlace.
 *
 * @example
 * orderAccessCookieName("cm1abc"); // "order_cm1abc"
 */
export function orderAccessCookieName(orderId: string): string {
  return `order_${orderId}`;
}
