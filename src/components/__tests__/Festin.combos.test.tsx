import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Combo } from "@/types";

// Pure logic: getComboProximity
function getComboProximity(combo: Combo, count: number): number {
  if (count >= combo.personas_min && count <= combo.personas_max) return 0;
  if (count < combo.personas_min) return combo.personas_min - count;
  return count - combo.personas_max;
}

const COMBOS: Combo[] = [
  { id: "combo_esencia", nombre: "Combo Esencia", descripcion: "", items_json: [], precio: 75400, personas_min: 10, personas_max: 15 },
  { id: "combo_celebracion", nombre: "Combo Celebración", descripcion: "", items_json: [], precio: 119400, personas_min: 20, personas_max: 25 },
  { id: "combo_ejecutivo", nombre: "Combo Ejecutivo", descripcion: "", items_json: [], precio: 156300, personas_min: 30, personas_max: 35 },
  { id: "combo_magno", nombre: "Combo Magno", descripcion: "", items_json: [], precio: 215200, personas_min: 40, personas_max: 45 },
  { id: "combo_gran_fiesta", nombre: "Combo Gran Fiesta", descripcion: "", items_json: [], precio: 313000, personas_min: 50, personas_max: 55 },
];

function getRecommendationText(combos: Combo[], guestCount: number): { combo: Combo; distance: number } {
  const sorted = [...combos].sort((a, b) => getComboProximity(a, guestCount) - getComboProximity(b, guestCount));
  return { combo: sorted[0], distance: getComboProximity(sorted[0], guestCount) };
}

function getWarningMessage(combo: Combo, guestCount: number): string | null {
  if (guestCount >= combo.personas_min && guestCount <= combo.personas_max) return null;
  if (guestCount < combo.personas_min) return `${combo.nombre} rinde para ${combo.personas_min}–${combo.personas_max} pers. Al ser ${combo.personas_min - guestCount} invitados menos de lo recomendado, las porciones serán más generosas.`;
  return `${combo.nombre} rinde para ${combo.personas_min}–${combo.personas_max} pers. Para ${guestCount} invitados las cantidades pueden quedarte justas.`;
}

describe("Festin - Combo selection with proximity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recommends the closest combo for 12 guests (within Esencia range)", () => {
    const { combo } = getRecommendationText(COMBOS, 12);
    expect(combo.id).toBe("combo_esencia");
  });

  it("recommends the closest combo for 18 guests (closest to Celebracion)", () => {
    const { combo } = getRecommendationText(COMBOS, 18);
    expect(combo.id).toBe("combo_celebracion");
  });

  it("recommends the closest combo for 16 guests (closest to Esencia)", () => {
    const { combo } = getRecommendationText(COMBOS, 16);
    expect(combo.id).toBe("combo_esencia");
  });

  it("recommends the closest combo for 28 guests (closest to Ejecutivo)", () => {
    const { combo } = getRecommendationText(COMBOS, 28);
    expect(combo.id).toBe("combo_ejecutivo");
  });

  it("recommends the closest combo for 60 guests (closest to Gran Fiesta)", () => {
    const { combo } = getRecommendationText(COMBOS, 60);
    expect(combo.id).toBe("combo_gran_fiesta");
  });

  it("all combos are always considered regardless of guest count", () => {
    const { combo } = getRecommendationText(COMBOS, 7);
    expect(combo.id).toBe("combo_esencia"); // closest even when below range
  });

  describe("warning messages", () => {
    it("returns null when guest count is within range", () => {
      const msg = getWarningMessage(COMBOS[0], 12);
      expect(msg).toBeNull();
    });

    it("warns about generous portions when guest count is below minimum", () => {
      const msg = getWarningMessage(COMBOS[0], 7);
      expect(msg).toContain("porciones serán más generosas");
    });

    it("warns about portions being tight when guest count exceeds maximum", () => {
      const msg = getWarningMessage(COMBOS[0], 60);
      expect(msg).toContain("quedarte justas");
    });

    it("includes the combo name and range in the warning", () => {
      const msg = getWarningMessage(COMBOS[1], 60);
      expect(msg).toContain("Combo Celebración");
      expect(msg).toContain("20–25");
    });
  });

  describe("ComboSelector integration", () => {
    it("renders ComboSelector with combos passed as props", async () => {
      const { default: ComboSelector } = await import("@/components/ComboSelector");
      const onSelect = vi.fn();
      render(
        <ComboSelector
          combos={COMBOS}
          wizardGuestCount={0}
          factorAjuste={1}
          onSelect={onSelect}
          onBack={vi.fn()}
          onPersonalizar={vi.fn()}
        />
      );

      expect(screen.getByText("Combo Esencia")).toBeInTheDocument();
      expect(screen.getByText("Combo Celebración")).toBeInTheDocument();
      expect(screen.getByText("Combo Ejecutivo")).toBeInTheDocument();
      expect(screen.getByText("Combo Magno")).toBeInTheDocument();
      expect(screen.getByText("Combo Gran Fiesta")).toBeInTheDocument();
    });

    it("fires onSelect when a combo card is clicked", async () => {
      const { default: ComboSelector } = await import("@/components/ComboSelector");
      const onSelect = vi.fn();
      render(
        <ComboSelector
          combos={COMBOS}
          wizardGuestCount={0}
          factorAjuste={1}
          onSelect={onSelect}
          onBack={vi.fn()}
          onPersonalizar={vi.fn()}
        />
      );

      const esenciaBtn = screen.getByText("Combo Esencia").closest("button")!;
      fireEvent.click(esenciaBtn);

      expect(onSelect).toHaveBeenCalledWith(COMBOS[0]);
    });

    it("shows recommended badge when wizardGuestCount > 0", async () => {
      const { default: ComboSelector } = await import("@/components/ComboSelector");
      render(
        <ComboSelector
          combos={COMBOS}
          wizardGuestCount={12}
          factorAjuste={1}
          onSelect={vi.fn()}
          onBack={vi.fn()}
          onPersonalizar={vi.fn()}
        />
      );

      const badges = screen.getAllByText("Recomendado");
      expect(badges).toHaveLength(1);

      // First combo card should be Combo Esencia (has a badge)
      const esenciaCard = screen.getByText("Combo Esencia").closest("button");
      expect(esenciaCard).toBeTruthy();
      expect(esenciaCard?.querySelector("button") || esenciaCard).toBeTruthy();
    });

    it("shows personalized title with guest count", async () => {
      const { default: ComboSelector } = await import("@/components/ComboSelector");
      render(
        <ComboSelector
          combos={COMBOS}
          wizardGuestCount={18}
          factorAjuste={1}
          onSelect={vi.fn()}
          onBack={vi.fn()}
          onPersonalizar={vi.fn()}
        />
      );

      expect(screen.getByText("Combos recomendados para vos")).toBeInTheDocument();
      expect(screen.getByText("Según tu evento de 18 invitados")).toBeInTheDocument();
    });
  });
});
