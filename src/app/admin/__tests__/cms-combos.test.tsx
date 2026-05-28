import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CMSPage from "@/app/admin/cms/page";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      then: vi.fn((cb: (...args: unknown[]) => unknown) => cb({ data: null, error: null })),
    }),
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: "test" }, error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/img.webp" } }),
      }),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { email: "admin@test.com" } } }),
    },
  }),
}));

vi.mock("@/lib/supabase", () => ({
  fetchAllCombosAdmin: vi.fn().mockResolvedValue([
    { id: "combo_esencia", nombre: "Combo Esencia", descripcion: "Ideal para 10-15", items_json: [{ id: "mini_hamburguesas", nombre: "Mini Hamburguesas", cantidad: 15, precio: 760 }], precio: 75400, personas_min: 10, personas_max: 15, activo: true, orden: 1 },
    { id: "combo_celebracion", nombre: "Combo Celebración", descripcion: "Perfecto para 20-25", items_json: [{ id: "mini_pizzas", nombre: "Mini Pizzas", cantidad: 20, precio: 560 }], precio: 119400, personas_min: 20, personas_max: 25, activo: true, orden: 2 },
  ]),
  updateComboAdmin: vi.fn().mockResolvedValue({ error: null }),
  createComboAdmin: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/lib/constants", () => ({
  WHATSAPP_NUMBER: "541176753854",
}));

vi.mock("@/lib/storage", () => ({
  uploadSiteImage: vi.fn().mockResolvedValue("https://example.com/img.webp"),
  deleteSiteImage: vi.fn().mockResolvedValue(undefined),
}));

describe("CMS Page - Combo Editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders combo section with combos loaded from DB", async () => {
    render(<CMSPage />);

    await waitFor(() => {
      expect(screen.getByText("CMS del Sitio")).toBeInTheDocument();
    });

    const combosBtn = screen.getByText("Combos");
    combosBtn.click();

    await waitFor(() => {
      expect(screen.getByText("Gestión de Combos")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Combo Esencia")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Combo Celebración")).toBeInTheDocument();
    });
  });

  it("shows combo fields: persons_min, persons_max, orden", async () => {
    render(<CMSPage />);

    await waitFor(() => {
      expect(screen.getByText("CMS del Sitio")).toBeInTheDocument();
    });

    screen.getByText("Combos").click();

    await waitFor(() => {
      expect(screen.getAllByText("Personas mín")).toHaveLength(2);
      expect(screen.getAllByText("Personas máx")).toHaveLength(2);
      expect(screen.getAllByText("Orden")).toHaveLength(2);
      expect(screen.getAllByText("Capacidad diaria (0 = ilimitado)")).toHaveLength(2);
    });
  });

  it("shows expandable product list for each combo", async () => {
    render(<CMSPage />);

    await waitFor(() => {
      expect(screen.getByText("CMS del Sitio")).toBeInTheDocument();
    });

    screen.getByText("Combos").click();

    await waitFor(() => {
      expect(screen.getAllByText(/Productos \(1\)/)).toHaveLength(2);
    });
  });

  it("shows Nuevo Combo button", async () => {
    render(<CMSPage />);

    await waitFor(() => {
      expect(screen.getByText("CMS del Sitio")).toBeInTheDocument();
    });

    screen.getByText("Combos").click();

    await waitFor(() => {
      expect(screen.getByText("+ Nuevo Combo")).toBeInTheDocument();
    });
  });

  it("shows Recargar button for combos", async () => {
    render(<CMSPage />);

    await waitFor(() => {
      expect(screen.getByText("CMS del Sitio")).toBeInTheDocument();
    });

    screen.getByText("Combos").click();

    await waitFor(() => {
      expect(screen.getByText("Recargar")).toBeInTheDocument();
    });
  });

  it("shows empty state when no combos", async () => {
    const { fetchAllCombosAdmin } = await import("@/lib/supabase");
    vi.mocked(fetchAllCombosAdmin).mockResolvedValueOnce([]);

    render(<CMSPage />);

    await waitFor(() => {
      expect(screen.getByText("CMS del Sitio")).toBeInTheDocument();
    });

    screen.getByText("Combos").click();

    await waitFor(() => {
      expect(screen.getByText("No hay combos registrados.")).toBeInTheDocument();
    });
  });
});
