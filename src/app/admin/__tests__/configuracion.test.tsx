import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ConfiguracionPage from "@/app/admin/configuracion/page";

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();
const mockSingle = vi.fn().mockResolvedValue({ data: { id: 1, factor_ajuste: 1.25, entorno: "produccion", capacidad_diaria_total: 0 }, error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockOrder = vi.fn().mockReturnThis();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: mockSelect,
      limit: mockLimit,
      single: mockSingle,
      upsert: mockUpsert,
      insert: mockInsert,
      order: mockOrder,
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb: (...args: unknown[]) => unknown) => cb({ data: null, error: null })),
    })),
  }),
}));

vi.mock("@/lib/constants", () => ({
  WHATSAPP_NUMBER: "541176753854",
}));

vi.mock("@/lib/supabase", () => ({
  fetchAdminLogs: vi.fn().mockResolvedValue([
    { id: "1", accion: "configuracion_actualizada", detalle: "factor_ajuste=1.25", usuario_email: "admin@test.com", created_at: new Date().toISOString() },
  ]),
}));

describe("Configuración Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<ConfiguracionPage />);
    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders all main tabs after loading", async () => {
    render(<ConfiguracionPage />);

    await waitFor(() => {
      expect(screen.getByText("Configuración General")).toBeInTheDocument();
    });

    expect(screen.getByText("Gestión Financiera")).toBeInTheDocument();
    expect(screen.getByText("Gestión Operativa")).toBeInTheDocument();
    expect(screen.getByText("Trazabilidad")).toBeInTheDocument();
  });

  it("shows financiera tab by default", async () => {
    render(<ConfiguracionPage />);

    await waitFor(() => {
      expect(screen.getByText("Factor de Ajuste Global")).toBeInTheDocument();
    });
  });

  it("loads factor_ajuste from DB", async () => {
    render(<ConfiguracionPage />);

    await waitFor(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="number"]');
      const factorInput = Array.from(inputs).find((i) => i.value === "1.25");
      expect(factorInput).toBeTruthy();
    });
  });

  it("switches between tabs", async () => {
    render(<ConfiguracionPage />);

    await waitFor(() => {
      expect(screen.getByText("Gestión Financiera")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Gestión Operativa"));
    await waitFor(() => {
      expect(screen.getByText("Capacidad Diaria Total")).toBeInTheDocument();
    });
  });

  describe("log viewer", () => {
    it("shows logs in Trazabilidad tab", async () => {
      render(<ConfiguracionPage />);

      await waitFor(() => {
        expect(screen.getByText("Trazabilidad")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("Trazabilidad"));

      await waitFor(() => {
        expect(screen.getByText("Trazabilidad del Sistema")).toBeInTheDocument();
        expect(screen.getByText("configuracion actualizada")).toBeInTheDocument();
        expect(screen.getByText("factor_ajuste=1.25")).toBeInTheDocument();
      });
    });

    it("shows reload button for logs", async () => {
      render(<ConfiguracionPage />);

      await waitFor(() => {
        expect(screen.getByText("Trazabilidad")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("Trazabilidad"));

      await waitFor(() => {
        expect(screen.getByText("Actualizar")).toBeInTheDocument();
      });
    });
  });

});
