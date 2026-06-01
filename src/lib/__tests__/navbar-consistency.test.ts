import { describe, it, expect } from "vitest";
import { DEFAULT_NAVBAR } from "@/lib/site-config";

describe("DEFAULT_NAVBAR internal consistency", () => {
  it("all hrefs start with #", () => {
    for (const link of DEFAULT_NAVBAR.links) {
      expect(link.href).toMatch(/^#[a-z-]+$/);
    }
  });

  it("no empty labels", () => {
    for (const link of DEFAULT_NAVBAR.links) {
      expect(link.label).toBeTruthy();
      expect(link.label.length).toBeGreaterThan(0);
    }
  });

  it("no empty hrefs", () => {
    for (const link of DEFAULT_NAVBAR.links) {
      expect(link.href).toBeTruthy();
      expect(link.href.length).toBeGreaterThan(1);
    }
  });

  it("contains all required links", () => {
    const hrefs = DEFAULT_NAVBAR.links.map((l) => l.href);
    expect(hrefs).toContain("#inicio");
    expect(hrefs).toContain("#elegirnos");
    expect(hrefs).toContain("#filosofia");
    expect(hrefs).toContain("#festin");
    expect(hrefs).toContain("#galeria");
    expect(hrefs).toContain("#contacto");
  });

  it("has exactly 6 links", () => {
    expect(DEFAULT_NAVBAR.links.length).toBe(6);
  });
});
