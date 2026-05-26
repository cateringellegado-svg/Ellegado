export const WHATSAPP_NUMBER = "541176753854";

export const WHATSAPP_MSG = encodeURIComponent(
  "Hola El Legado, me gustaría obtener más información sobre sus servicios de catering."
);

export function getWhatsAppUrl(phone: string, msg?: string): string {
  const text = msg ? encodeURIComponent(msg) : WHATSAPP_MSG;
  const phoneNumber = phone || WHATSAPP_NUMBER;
  return `https://wa.me/${phoneNumber}?text=${text}`;
}
