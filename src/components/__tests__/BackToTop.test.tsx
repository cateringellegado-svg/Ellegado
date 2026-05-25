import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BackToTop from "@/components/BackToTop";

describe("BackToTop", () => {
  it("renders the button", () => {
    render(<BackToTop />);
    const btn = screen.getByRole("button", { name: "Volver arriba" });
    expect(btn).toBeInTheDocument();
  });

  it("is hidden initially", () => {
    render(<BackToTop />);
    const btn = screen.getByRole("button", { name: "Volver arriba" });
    expect(btn.className).toContain("opacity-0");
  });
});
