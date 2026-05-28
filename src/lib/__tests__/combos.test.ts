import { describe, it, expect } from "vitest";
import type { Combo } from "@/types";

const FALLBACK_COMBOS: Combo[] = [
  { id: "combo_esencia", nombre: "Combo Esencia", descripcion: "", items_json: [], precio: 75400, personas_min: 10, personas_max: 15 },
  { id: "combo_celebracion", nombre: "Combo Celebración", descripcion: "", items_json: [], precio: 119400, personas_min: 20, personas_max: 25 },
  { id: "combo_ejecutivo", nombre: "Combo Ejecutivo", descripcion: "", items_json: [], precio: 156300, personas_min: 30, personas_max: 35 },
  { id: "combo_magno", nombre: "Combo Magno", descripcion: "", items_json: [], precio: 215200, personas_min: 40, personas_max: 45 },
  { id: "combo_gran_fiesta", nombre: "Combo Gran Fiesta", descripcion: "", items_json: [], precio: 313000, personas_min: 50, personas_max: 55 },
];

function getComboProximity(combo: Combo, count: number): number {
  if (count >= combo.personas_min && count <= combo.personas_max) return 0;
  if (count < combo.personas_min) return combo.personas_min - count;
  return count - combo.personas_max;
}

function sortCombosByProximity(combos: Combo[], guestCount: number): Combo[] {
  if (guestCount <= 0) return combos;
  return [...combos].sort((a, b) => {
    const distA = getComboProximity(a, guestCount);
    const distB = getComboProximity(b, guestCount);
    return distA - distB;
  });
}

describe("getComboProximity", () => {
  it("returns 0 when guest count is within range", () => {
    const combo = FALLBACK_COMBOS[0]; // 10-15
    expect(getComboProximity(combo, 12)).toBe(0);
    expect(getComboProximity(combo, 10)).toBe(0);
    expect(getComboProximity(combo, 15)).toBe(0);
  });

  it("returns positive distance when below minimum", () => {
    const combo = FALLBACK_COMBOS[1]; // 20-25
    expect(getComboProximity(combo, 18)).toBe(2);
    expect(getComboProximity(combo, 10)).toBe(10);
    expect(getComboProximity(combo, 19)).toBe(1);
  });

  it("returns positive distance when above maximum", () => {
    const combo = FALLBACK_COMBOS[0]; // 10-15
    expect(getComboProximity(combo, 18)).toBe(3);
    expect(getComboProximity(combo, 20)).toBe(5);
  });

  it("distance is symmetric: below vs above", () => {
    const combo = FALLBACK_COMBOS[2]; // 30-35
    expect(getComboProximity(combo, 28)).toBe(2); // 2 below min
    expect(getComboProximity(combo, 37)).toBe(2); // 2 above max
  });
});

describe("sortCombosByProximity", () => {
  it("returns combos unsorted when guest count is 0", () => {
    const result = sortCombosByProximity(FALLBACK_COMBOS, 0);
    expect(result).toEqual(FALLBACK_COMBOS);
  });

  it("returns combos unsorted when guest count is negative", () => {
    const result = sortCombosByProximity(FALLBACK_COMBOS, -1);
    expect(result).toEqual(FALLBACK_COMBOS);
  });

  it("does not mutate the original array", () => {
    const original = [...FALLBACK_COMBOS];
    sortCombosByProximity(FALLBACK_COMBOS, 12);
    expect(FALLBACK_COMBOS).toEqual(original);
  });

  it("places exact-match combo first when count is within range", () => {
    const sorted = sortCombosByProximity(FALLBACK_COMBOS, 12);
    expect(sorted[0].id).toBe("combo_esencia");
  });

  it("places closest combo first for in-between counts (18 guests)", () => {
    const sorted = sortCombosByProximity(FALLBACK_COMBOS, 18);
    // combo_celebracion distance: 20-18=2, combo_esencia distance: 18-15=3
    expect(sorted[0].id).toBe("combo_celebracion");
  });

  it("places closest combo first for in-between counts (16 guests)", () => {
    const sorted = sortCombosByProximity(FALLBACK_COMBOS, 16);
    // combo_esencia distance: 16-15=1, combo_celebracion distance: 20-16=4
    expect(sorted[0].id).toBe("combo_esencia");
  });

  it("places closest combo first for in-between counts (28 guests)", () => {
    const sorted = sortCombosByProximity(FALLBACK_COMBOS, 28);
    // combo_ejecutivo distance: 30-28=2, combo_celebracion distance: 28-25=3
    expect(sorted[0].id).toBe("combo_ejecutivo");
  });

  it("places closest combo first for counts above max range (60 guests)", () => {
    const sorted = sortCombosByProximity(FALLBACK_COMBOS, 60);
    // combo_gran_fiesta distance: 60-55=5, combo_magno distance: 60-45=15
    expect(sorted[0].id).toBe("combo_gran_fiesta");
  });

  it("orders all combos by ascending distance", () => {
    const sorted = sortCombosByProximity(FALLBACK_COMBOS, 22);
    // 22 is within combo_celebracion range (20-25) → distance 0
    // Remaining distances: esencia 22-15=7, ejecutivo 30-22=8, magno 40-22=18, gran_fiesta 50-22=28
    expect(sorted[0].id).toBe("combo_celebracion");
    expect(sorted[1].id).toBe("combo_esencia");
    expect(sorted[2].id).toBe("combo_ejecutivo");
    expect(sorted[3].id).toBe("combo_magno");
    expect(sorted[4].id).toBe("combo_gran_fiesta");
  });
});
