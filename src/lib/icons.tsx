import type { LucideIcon } from "lucide-react";
import {
  ChefHat, Sparkles, Heart, Star, Utensils, Leaf, Flame, Wine,
  Coffee, Cake, Crown, Gift, Music, Sun, Calendar, Users,
  PartyPopper, Salad, Pizza, Sandwich, Cookie, Milk, Apple,
  Grape, Citrus, CupSoda, Croissant, IceCream, Candy, CandyCane,
  Cherry, Flower, Palette, Camera, Tv, Book, Dumbbell, Globe,
  Smile, ThumbsUp, Bell,   Shield, ShieldCheck, Truck, Clock, MapPin, Phone,
} from "lucide-react";

const ICON_LIBRARY: Record<string, { icon: LucideIcon; label: string }> = {
  bowl: { icon: Utensils, label: "Bowls" },
  smoothie: { icon: CupSoda, label: "Smoothie" },
  grill: { icon: Flame, label: "Parrilla" },
  cheese: { icon: Cookie, label: "Queso" },
  chef: { icon: ChefHat, label: "Chef" },
  sparkles: { icon: Sparkles, label: "Destellos" },
  heart: { icon: Heart, label: "Corazón" },
  star: { icon: Star, label: "Estrella" },
  utensils: { icon: Utensils, label: "Utensilios" },
  leaf: { icon: Leaf, label: "Hoja" },
  flame: { icon: Flame, label: "Llama" },
  wine: { icon: Wine, label: "Vino" },
  coffee: { icon: Coffee, label: "Café" },
  cake: { icon: Cake, label: "Torta" },
  crown: { icon: Crown, label: "Corona" },
  gift: { icon: Gift, label: "Regalo" },
  music: { icon: Music, label: "Música" },
  sun: { icon: Sun, label: "Sol" },
  calendar: { icon: Calendar, label: "Calendario" },
  users: { icon: Users, label: "Usuarios" },
  party: { icon: PartyPopper, label: "Fiesta" },
  salad: { icon: Salad, label: "Ensalada" },
  pizza: { icon: Pizza, label: "Pizza" },
  sandwich: { icon: Sandwich, label: "Sándwich" },
  cookie: { icon: Cookie, label: "Galleta" },
  milk: { icon: Milk, label: "Leche" },
  apple: { icon: Apple, label: "Manzana" },
  grape: { icon: Grape, label: "Uva" },
  citrus: { icon: Citrus, label: "Citrus" },
  cup: { icon: CupSoda, label: "Vaso" },
  croissant: { icon: Croissant, label: "Croissant" },
  ice: { icon: IceCream, label: "Helado" },
  candy: { icon: Candy, label: "Caramelo" },
  candy_cane: { icon: CandyCane, label: "Bastón" },
  cherry: { icon: Cherry, label: "Cereza" },
  flower: { icon: Flower, label: "Flor" },
  palette: { icon: Palette, label: "Paleta" },
  camera: { icon: Camera, label: "Cámara" },
  tv: { icon: Tv, label: "TV" },
  book: { icon: Book, label: "Libro" },
  globe: { icon: Globe, label: "Globo" },
  smile: { icon: Smile, label: "Sonrisa" },
  thumbs: { icon: ThumbsUp, label: "Pulgar" },
  bell: { icon: Bell, label: "Campana" },
  shield: { icon: Shield, label: "Escudo" },
  shield_check: { icon: ShieldCheck, label: "Escudo Verificado" },
  truck: { icon: Truck, label: "Camión" },
  clock: { icon: Clock, label: "Reloj" },
  pin: { icon: MapPin, label: "Ubicación" },
  phone: { icon: Phone, label: "Teléfono" },
};

export function getIcon(name: string): LucideIcon | null {
  return ICON_LIBRARY[name.toLowerCase()]?.icon ?? null;
}

export function getIconLabel(name: string): string {
  return ICON_LIBRARY[name.toLowerCase()]?.label ?? name;
}

export function getAllIcons(): { name: string; icon: LucideIcon; label: string }[] {
  return Object.entries(ICON_LIBRARY).map(([name, entry]) => ({
    name,
    icon: entry.icon,
    label: entry.label,
  }));
}

export type { LucideIcon };

export function iconProps(style: "outline" | "solid"): { strokeWidth: number; fill: string } {
  return style === "solid"
    ? { strokeWidth: 0.5, fill: "currentColor" }
    : { strokeWidth: 1.5, fill: "none" };
}
