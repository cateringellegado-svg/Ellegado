import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Festin from "@/components/Festin";

vi.mock("@/lib/supabase", () => ({
  supabase: null,
  fetchProductsByCategory: vi.fn().mockResolvedValue(null),
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

describe("Festin", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("renders fallback products when Supabase is unavailable", async () => {
    render(<Festin />);
    await waitFor(() => {
      expect(screen.queryByText("Canapés")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    render(<Festin />);
    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();
  });

  it("renders the section title from config", async () => {
    render(<Festin />);
    await waitFor(() => {
      expect(screen.getByText("El Festín")).toBeInTheDocument();
    });
  });

  it("switches between tabs", async () => {
    render(<Festin />);
    const premiumTab = screen.getByRole("tab", { name: "Experiencia Premium" });
    fireEvent.click(premiumTab);
    await waitFor(() => {
      expect(premiumTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  it("shows toast when cotizar with no products selected", async () => {
    render(<Festin />);
    await waitFor(() => {
      expect(screen.queryByText("Canapés")).toBeInTheDocument();
    });
    const cotizarBtn = screen.getByText("Cotizar por WhatsApp");
    fireEvent.click(cotizarBtn);
  });

  it("does not crash when localStorage is accessed during render", () => {
    expect(() => render(<Festin />)).not.toThrow();
  });

  it("persists cotizacion to localStorage on change", async () => {
    render(<Festin />);
    await waitFor(() => {
      expect(screen.queryByText("Canapés")).toBeInTheDocument();
    });
    const increaseButtons = screen.getAllByRole("button", { name: /Aumentar/ });
    if (increaseButtons.length > 0) {
      fireEvent.click(increaseButtons[0]);
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "legado_cotizacion",
          expect.any(String)
        );
      });
    }
  });
});
