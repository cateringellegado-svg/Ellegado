import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ComboSelector from "@/components/ComboSelector";
import type { Combo } from "@/types";

const MOCK_COMBOS: Combo[] = [
  { id: "combo_esencia", nombre: "Combo Esencia", descripcion: "Ideal para 10 a 15 personas.", items_json: [{ id: "item1", nombre: "Canapés", cantidad: 25, precio: 500 }], precio: 75400, personas_min: 10, personas_max: 15 },
  { id: "combo_celebracion", nombre: "Combo Celebración", descripcion: "Perfecto para 20 a 25 personas.", items_json: [{ id: "item2", nombre: "Pizzas", cantidad: 20, precio: 560 }], precio: 119400, personas_min: 20, personas_max: 25 },
  { id: "combo_ejecutivo", nombre: "Combo Ejecutivo", descripcion: "Para 30 a 35 personas.", items_json: [{ id: "item3", nombre: "Canapés", cantidad: 60, precio: 500 }], precio: 156300, personas_min: 30, personas_max: 35 },
];

describe("ComboSelector", () => {
  const baseProps = {
    combos: MOCK_COMBOS,
    wizardGuestCount: 0,
    factorAjuste: 1,
    onSelect: vi.fn(),
    onBack: vi.fn(),
    onPersonalizar: vi.fn(),
  };

  it("renders all combos", () => {
    render(<ComboSelector {...baseProps} />);
    expect(screen.getByText("Combo Esencia")).toBeInTheDocument();
    expect(screen.getByText("Combo Celebración")).toBeInTheDocument();
    expect(screen.getByText("Combo Ejecutivo")).toBeInTheDocument();
  });

  it("shows generic title when no guest count", () => {
    render(<ComboSelector {...baseProps} />);
    expect(screen.getByText("Elegí tu Combo")).toBeInTheDocument();
  });

  it("shows personalized title when guest count provided", () => {
    render(<ComboSelector {...baseProps} wizardGuestCount={18} />);
    expect(screen.getByText("Combos recomendados para vos")).toBeInTheDocument();
    expect(screen.getByText("Según tu evento de 18 invitados")).toBeInTheDocument();
  });

  it("marks the first combo as recommended when guest count > 0", () => {
    render(<ComboSelector {...baseProps} wizardGuestCount={18} />);
    const recomendedBadges = screen.getAllByText("Recomendado");
    expect(recomendedBadges).toHaveLength(1);
  });

  it("does not show recommended badge when guest count is 0", () => {
    render(<ComboSelector {...baseProps} />);
    expect(screen.queryByText("Recomendado")).not.toBeInTheDocument();
  });

  it("renders combo items with quantities", () => {
    render(<ComboSelector {...baseProps} />);
    expect(screen.getAllByText("Canapés")).toHaveLength(2);
    expect(screen.getByText("25 u.")).toBeInTheDocument();
    expect(screen.getByText("60 u.")).toBeInTheDocument();
  });

  it("renders formatted price for each combo", () => {
    render(<ComboSelector {...baseProps} />);
    expect(screen.getByText("$75.400")).toBeInTheDocument();
    expect(screen.getByText("$119.400")).toBeInTheDocument();
    expect(screen.getByText("$156.300")).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(<ComboSelector {...baseProps} />);
    expect(screen.getByText("← Volver")).toBeInTheDocument();
    expect(screen.getByText("Personalizar menú →")).toBeInTheDocument();
  });

  it("handles empty combos gracefully", () => {
    render(<ComboSelector {...baseProps} combos={[]} />);
    expect(screen.getByText("Elegí tu Combo")).toBeInTheDocument();
  });

  it("shows person range for each combo", () => {
    render(<ComboSelector {...baseProps} />);
    expect(screen.getByText("10–15 pers.")).toBeInTheDocument();
    expect(screen.getByText("20–25 pers.")).toBeInTheDocument();
    expect(screen.getByText("30–35 pers.")).toBeInTheDocument();
  });
});
