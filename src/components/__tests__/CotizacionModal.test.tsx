import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CotizacionModal from "@/components/CotizacionModal";

vi.mock("@/lib/site-config", () => ({
  useSiteConfig: () => ({
    contact: { whatsapp: "54123456789", email: "" },
    images: {},
    hero: { title: "", subtitle: "", tagline: "", stats: [], ctaText: "" },
    navbar: { logoUrl: "", links: [] },
    festin: { title: "", subtitle: "", ctaText: "" },
    categories: [],
  }),
  SiteConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockShowToast = vi.fn();
vi.mock("@/components/Toast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/lib/supabase", () => ({
  fetchConfiguracionCompleta: vi.fn().mockResolvedValue({ capacidad_diaria_total: null }),
}));

vi.mock("@/lib/constants", () => ({
  MIN_PRODUCT_UNITS: 50,
  COMBO_IDS: ["combo_esencia", "combo_celebracion", "combo_ejecutivo", "combo_magno", "combo_gran_fiesta"],
  getWhatsAppUrl: vi.fn(() => "https://wa.me/54123456789?text=test"),
}));

const mockCotizacion = {
  "1": { id: "1", nombre: "Canapés", cantidad: 50, precio: 1000, subtotal: 50000 },
};
const mockOnClose = vi.fn();

describe("CotizacionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CotizacionModal isOpen={false} onClose={mockOnClose} cotizacion={{}} total={0} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders the form when isOpen is true", () => {
    render(
      <CotizacionModal isOpen={true} onClose={mockOnClose} cotizacion={{}} total={0} />
    );
    expect(screen.getByText("Casi listo...")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre y Apellido *")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono *")).toBeInTheDocument();
  });

  it("calls onClose when clicking close button", () => {
    render(
      <CotizacionModal isOpen={true} onClose={mockOnClose} cotizacion={{}} total={0} />
    );
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on Escape key", () => {
    render(
      <CotizacionModal isOpen={true} onClose={mockOnClose} cotizacion={{}} total={0} />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("submits the form and calls fetch", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });
    global.open = vi.fn();

    render(
      <CotizacionModal isOpen={true} onClose={mockOnClose} cotizacion={mockCotizacion} total={50000} />
    );

    fireEvent.change(screen.getByLabelText("Nombre y Apellido *"), { target: { value: "Juan Pérez" } });
    fireEvent.change(screen.getByLabelText("Teléfono *"), { target: { value: "54123456789" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"));
    });
    fireEvent.click(screen.getByText("Enviar a WhatsApp"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith("Cotización enviada correctamente", "success");
  });

  it("shows error toast when API returns error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Error de validación" }),
    });

    render(
      <CotizacionModal isOpen={true} onClose={mockOnClose} cotizacion={mockCotizacion} total={50000} />
    );

    fireEvent.change(screen.getByLabelText("Nombre y Apellido *"), { target: { value: "Juan Pérez" } });
    fireEvent.change(screen.getByLabelText("Teléfono *"), { target: { value: "54123456789" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"));
    });
    fireEvent.click(screen.getByText("Enviar a WhatsApp"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Error de validación", "error");
    });
  });

  it("shows network error toast when fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    render(
      <CotizacionModal isOpen={true} onClose={mockOnClose} cotizacion={mockCotizacion} total={50000} />
    );

    fireEvent.change(screen.getByLabelText("Nombre y Apellido *"), { target: { value: "Juan Pérez" } });
    fireEvent.change(screen.getByLabelText("Teléfono *"), { target: { value: "54123456789" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox"));
    });
    fireEvent.click(screen.getByText("Enviar a WhatsApp"));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Error de red. Verificá tu conexión e intentá de nuevo.", "error");
    });
  });
});
