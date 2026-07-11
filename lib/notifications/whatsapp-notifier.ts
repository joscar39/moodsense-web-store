import { formatPrice } from "@/lib/format/price";

/**
 * Abstracción del envío de WhatsApp al operador de la tienda.
 *
 * Implementaciones:
 * - CloudApiWhatsappNotifier: WhatsApp Business Cloud API de Meta (opción
 *   oficial más económica: capa gratuita amplia, sin intermediarios). Se
 *   activa automáticamente cuando WHATSAPP_CLOUD_API_TOKEN y
 *   WHATSAPP_CLOUD_PHONE_NUMBER_ID están configurados. Requiere verificación
 *   de negocio en Meta para producción.
 * - ConsoleWhatsappNotifier: fallback provisional mientras se gestiona el
 *   acceso a la API — loggea el mensaje completo y un link wa.me listo para
 *   reenviar por cualquier canal.
 *
 * Cambiar de proveedor = una sola implementación nueva de WhatsappNotifier;
 * el resto del flujo no se toca.
 */
export interface WhatsappNotifier {
  sendToOperator(message: string): Promise<void>;
}

export type OrderMessageData = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shipping: string;
  lines: { name: string; variantLabel: string | null; quantity: number; unitPriceCents: number }[];
  totalCents: number;
};

/** Mensaje de pedido para el operador, legible en WhatsApp. */
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

class CloudApiWhatsappNotifier implements WhatsappNotifier {
  constructor(
    private readonly token: string,
    private readonly phoneNumberId: string,
    private readonly operatorPhone: string
  ) {}

  async sendToOperator(message: string): Promise<void> {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: this.operatorPhone,
          type: "text",
          text: { body: message },
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`WhatsApp Cloud API respondió ${response.status}: ${await response.text()}`);
    }
  }
}

class ConsoleWhatsappNotifier implements WhatsappNotifier {
  constructor(private readonly operatorPhone: string | undefined) {}

  async sendToOperator(message: string): Promise<void> {
    const waLink = this.operatorPhone
      ? `https://wa.me/${this.operatorPhone}?text=${encodeURIComponent(message)}`
      : "(configura WHATSAPP_OPERATOR_PHONE para generar el link wa.me)";
    console.log(
      `[whatsapp] Notificación de pedido (modo provisional — sin Cloud API):\n${message}\n\n[whatsapp] Link directo: ${waLink}`
    );
  }
}

export function getWhatsappNotifier(): WhatsappNotifier {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
  const operatorPhone = process.env.WHATSAPP_OPERATOR_PHONE;

  if (token && phoneNumberId && operatorPhone) {
    return new CloudApiWhatsappNotifier(token, phoneNumberId, operatorPhone);
  }
  return new ConsoleWhatsappNotifier(operatorPhone);
}
