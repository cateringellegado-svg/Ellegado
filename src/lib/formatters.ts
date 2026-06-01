export function formatARS(value: number | null | undefined): string {
  if (value == null) return "Por definir";
  return "$" + value.toLocaleString("es-AR");
}

export function calcAnticipo(total: number): number {
  return Math.round(total * 0.5);
}
