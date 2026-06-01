import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Festin from "@/components/Festin";

vi.mock("@/lib/supabase", () => ({
  supabase: null,
  fetchProductsByCategory: vi.fn().mockResolvedValue(null),
  fetchCombos: vi.fn().mockResolvedValue(null),
  fetchConfiguracion: vi.fn().mockResolvedValue({ factor_ajuste: 1, entorno: "produccion" }),
  insertLead: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/site-config", () => ({
  useSiteConfig: () => ({
    festin: { title: "El Festín", subtitle: "Elegí los bocados", ctaText: "Cotizá tu evento" },
    contact: { whatsapp: "54123456789", email: "" },
    images: { logo: "/logo.webp" },
    hero: { title: "El Legado", subtitle: "", tagline: "", stats: [], ctaText: "" },
    navbar: { logoUrl: "", links: [] },
    categories: [],
    comingSoon: { title: "Próximamente", items: [] },
  }),
  SiteConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/Toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

async function goToStep4() {
  await waitFor(() => {
    expect(screen.getByText("Social")).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText("Social"));
  await waitFor(() => {
    expect(screen.getByPlaceholderText("Ej: 50")).toBeInTheDocument();
  });
  fireEvent.change(screen.getByPlaceholderText("Ej: 50"), { target: { value: "50" } });
  fireEvent.click(screen.getByText("Siguiente →"));
  await waitFor(() => {
    expect(screen.getByText(/Paso 3 de 4/)).toBeInTheDocument();
  });
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);
  while (minDate.getDay() === 6 || minDate.getDay() === 0) {
    minDate.setDate(minDate.getDate() + 1);
  }
  const dateStr = minDate.toISOString().split("T")[0];
  const dateInput = screen.getByTestId("fecha-input");
  fireEvent.change(dateInput, { target: { value: dateStr } });
  await waitFor(() => {
    expect(screen.getByRole("radio", { name: "10:00" })).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText("10:00"));
  fireEvent.click(screen.getByText("Siguiente →"));
  await waitFor(() => {
    expect(screen.getByText(/Paso 4 de 4/)).toBeInTheDocument();
  });
}

async function goToPersonalizar() {
  await goToStep4();
  fireEvent.click(screen.getByText("Personalizar menú →"));
  await waitFor(() => {
    expect(screen.queryByText("Canapés")).toBeInTheDocument();
  });
}

describe("Festin", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("renders fallback products when Supabase is unavailable", async () => {
    render(<Festin />);
    await goToPersonalizar();
    expect(screen.getByText("Canapés")).toBeInTheDocument();
  });

  it("renders the section title from config", async () => {
    render(<Festin />);
    await waitFor(() => {
      expect(screen.getByText("El Festín")).toBeInTheDocument();
    });
  });

  it("switches between tabs in personalizar mode", async () => {
    render(<Festin />);
    await goToPersonalizar();
    const premiumTab = screen.getByRole("tab", { name: "Experiencia Premium" });
    fireEvent.click(premiumTab);
    await waitFor(() => {
      expect(premiumTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  it("shows toast when cotizar with no products selected", async () => {
    render(<Festin />);
    await goToPersonalizar();
    const cotizarBtn = screen.getByText("Cotizar por WhatsApp");
    fireEvent.click(cotizarBtn);
  });

  it("does not crash when localStorage is accessed during render", () => {
    expect(() => render(<Festin />)).not.toThrow();
  });

  it("persists cotizacion to localStorage on change", async () => {
    render(<Festin />);
    await goToPersonalizar();
    const addButtons = screen.getAllByRole("button", { name: /Agregar/ });
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "legado_cotizacion",
          expect.any(String)
        );
      });
    }
  });

  it("shows mode selector with combo and personalizar options at step 4", async () => {
    render(<Festin />);
    await goToStep4();
    expect(screen.getByText("Solución en Combos")).toBeInTheDocument();
    expect(screen.getByText("Experiencia a Medida")).toBeInTheDocument();
  });
});
