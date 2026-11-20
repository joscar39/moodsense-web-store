import { formatPrice } from "@/lib/format/price";

/**
 * Avisos por WhatsApp al operador de la tienda.
 *
 * El resto del código solo usa `buildOrderMessage` y `notifyOperator`; el
 * proveedor concreto (hoy, la WhatsApp Business Cloud API de Meta) queda
 * escondido en este archivo. Cambiar de proveedor = cambiar solo este módulo.
 */

type OrderMessageData = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shipping: string;
  lines: { name: string; variantLabel: string | null; quantity: number; unitPriceCents: number }[];
  totalCents: number;
};

/**
 * Arma el texto del aviso de un pedido nuevo, listo para leer en WhatsApp.
 *
 * Para qué: es el mensaje que recibe el operador para contactar al cliente y
 * coordinar el pago.
 *
 * @example
 * buildOrderMessage({
 *   orderId: "cm1abc",
 *   customerName: "Ana Pérez",
 *   customerPhone: "+1 809 555 0100",
 *   shipping: "Calle 1, Santo Domingo, DO",
 *   lines: [{ name: "Gorra Logo", variantLabel: "Negro", quantity: 2, unitPriceCents: 2500 }],
 *   totalCents: 5000,
 * });
 * // "🛍️ *NUEVO PEDIDO — Mood Sense*\n\nPedido: cm1abc\n\n• 2 × Gorra Logo (Negro) — $50.00 ..."
 */
export function buildOrderMessage(data: OrderMessageData): string {
  const items = data.lines
    .map(
      (line) =>
        `• ${line.quantity} × ${line.name}${line.variantLabel ? ` (${line.variantLabel})` : ""} — ${formatPrice(line.unitPriceCents * line.quantity)}`
    )
    .join("\n");

  return [
    "🛍️ *NUEVO PEDIDO — Mood Sense*",
    "",
    `Pedido: ${data.orderId}`,
    "",
    items,
    "",
    `*Total: ${formatPrice(data.totalCents)}*`,
    "",
    `Cliente: ${data.customerName}`,
    `WhatsApp: ${data.customerPhone}`,
    ...(data.customerEmail ? [`Email: ${data.customerEmail}`] : []),
    `Envío: ${data.shipping}`,
    "",
    "⚠️ Pendiente de confirmación de pago. Márcalo como pagado en el panel admin cuando verifiques la transferencia.",
  ].join("\n");
}

/**
 * Envía `message` al WhatsApp del operador (WHATSAPP_OPERATOR_PHONE).
 *
 * - Con WHATSAPP_CLOUD_API_TOKEN y WHATSAPP_CLOUD_PHONE_NUMBER_ID configurados,
 *   lo manda por la Cloud API de Meta. Meta solo entrega texto libre si el
 *   operador escribió al número emisor en las últimas 24 h.
 * - Sin esas claves, NO envía nada: deja en el log solo el id del pedido (nunca
 *   datos personales del cliente). El operador ve el pedido en el panel admin.
 *
 * Lanza un error si Meta responde con fallo; quien la llama decide qué hacer
 * (el checkout lo registra y sigue, porque el pedido ya está guardado).
 *
 * @example
 * await notifyOperator(buildOrderMessage(data), data.orderId);
 */
export async function notifyOperator(message: string, orderId: string): Promise<void> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
  // Solo dígitos: tolera que el número se haya cargado con "+", espacios o guiones.
  const operatorPhone = process.env.WHATSAPP_OPERATOR_PHONE?.replace(/\D/g, "");

  if (!token || !phoneNumberId || !operatorPhone) {
    console.log(
      `[whatsapp] Pedido ${orderId} recibido. Aviso automático desactivado (falta configurar la Cloud API): revisar el panel admin.`
    );
    return;
  }

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: operatorPhone,
      type: "text",
      text: { body: message },
    }),
  });
  if (!response.ok) {
    throw new Error(`WhatsApp Cloud API respondió ${response.status}`);
  }
}
