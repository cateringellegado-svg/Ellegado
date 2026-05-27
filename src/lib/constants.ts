export const WHATSAPP_NUMBER = "541176753854";

export const WHATSAPP_MSG = encodeURIComponent(
  "Hola El Legado, me gustaría obtener más información sobre sus servicios de catering."
);

export const MIN_PRODUCT_UNITS = 50;

export const COMBO_MINIMUMS: Record<string, number> = {
  combo_clasico: 15,
  combo_dulce: 20,
  combo_ejecutivo: 20,
  combo_premium: 20,
  combo_gran_fiesta: 40,
};

export const COMBO_IDS = Object.keys(COMBO_MINIMUMS);

export function getWhatsAppUrl(phone: string, msg?: string): string {
  const text = msg ? encodeURIComponent(msg) : WHATSAPP_MSG;
  const phoneNumber = phone || WHATSAPP_NUMBER;
  return `https://wa.me/${phoneNumber}?text=${text}`;
}
