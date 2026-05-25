export const WHATSAPP_NUMBER = "541176753854";

export const WHATSAPP_MSG = encodeURIComponent(
  "Hola El Legado, me gustaría obtener más información sobre sus servicios de catering."
);

export function getWhatsAppUrl(msg?: string): string {
  const text = msg ? encodeURIComponent(msg) : WHATSAPP_MSG;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
