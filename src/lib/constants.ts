export const WHATSAPP_NUMBER = "541176753854";

export const WHATSAPP_MSG = encodeURIComponent(
  "Hola El Legado, me gustaría obtener más información sobre sus servicios de catering."
);

export const MIN_PRODUCT_UNITS = 50;

export const COMBO_MINIMUMS: Record<string, number> = {
  combo_esencia: 10,
  combo_celebracion: 20,
  combo_ejecutivo: 30,
  combo_magno: 40,
  combo_gran_fiesta: 50,
};

export const COMBO_IDS = Object.keys(COMBO_MINIMUMS);

export function getWhatsAppUrl(phone: string, msg?: string): string {
  const text = msg ? encodeURIComponent(msg) : WHATSAPP_MSG;
  const phoneNumber = phone || WHATSAPP_NUMBER;
  return `https://wa.me/${phoneNumber}?text=${text}`;
}
