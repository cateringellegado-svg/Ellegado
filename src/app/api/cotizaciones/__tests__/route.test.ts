import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ data: [{ id: "123" }], error: null }),
      })),
    })),
  })),
}));

const validBody = {
  total_unidades: 50,
  productos: [{ nombre: "Canapés", cantidad: 2 }],
  total: 50000,
  fecha_entrega: "2026-06-15",
  cliente_nombre: "Juan Pérez",
  cliente_telefono: "54123456789",
  cliente_email: "juan@example.com",
};

function createRequest(body: unknown, ip = "127.0.0.1") {
  return new NextRequest("http://localhost:3000/api/cotizaciones", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/cotizaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
  });

  it("returns 201 for valid request", async () => {
    const req = createRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("returns 400 for invalid body", async () => {
    const req = createRequest({ ...validBody, cliente_nombre: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Datos inválidos");
  });

  it("returns 400 for missing productos", async () => {
    const req = createRequest({ ...validBody, productos: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for negative total", async () => {
    const req = createRequest({ ...validBody, total: -1 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 503 when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const req = createRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    const req = createRequest(validBody);
    let res: Response;
    for (let i = 0; i < 6; i++) {
      res = await POST(req);
    }
    expect(res!).toBeDefined();
    expect(res!.status).toBe(429);
  });
});
