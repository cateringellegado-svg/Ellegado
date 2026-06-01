import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Navbar from "@/components/Navbar";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    return <img src={src as string} alt={alt as string} {...rest} />;
  },
}));

vi.mock("@/lib/site-config", () => ({
  useSiteConfig: () => ({
    navbar: {
      logoUrl: "/logo.webp",
      links: [
        { label: "Inicio", href: "#inicio" },
        { label: "Elegirnos", href: "#elegirnos" },
        { label: "Filosofía", href: "#filosofia" },
        { label: "Festín", href: "#festin" },
        { label: "Galería", href: "#galeria" },
        { label: "Contacto", href: "#contacto" },
      ],
    },
  }),
}));

describe("Navbar", () => {
  it("renders all navigation links (desktop)", () => {
    render(<Navbar />);
    const desktopLinks = screen.getAllByText("Inicio");
    expect(desktopLinks.length).toBe(2);
    const elegirnos = screen.getAllByText("Elegirnos");
    expect(elegirnos.length).toBe(2);
    const filosofia = screen.getAllByText("Filosofía");
    expect(filosofia.length).toBe(2);
    const festin = screen.getAllByText("Festín");
    expect(festin.length).toBe(2);
    const galeria = screen.getAllByText("Galería");
    expect(galeria.length).toBe(2);
    const contacto = screen.getAllByText("Contacto");
    expect(contacto.length).toBe(2);
  });

  it("all desktop hrefs point to valid section anchors", () => {
    render(<Navbar />);
    const desktopLinks = document.querySelectorAll(
      ".hidden.sm\\:block"
    ) as NodeListOf<HTMLAnchorElement>;
    desktopLinks.forEach((link) => {
      const href = link.getAttribute("href");
      expect(href).toMatch(/^#[a-z-]+$/);
    });
  });

  it("opens mobile menu when hamburger is clicked", () => {
    render(<Navbar />);
    const openBtn = screen.getByLabelText("Abrir menú");
    fireEvent.click(openBtn);
    const closeButtons = screen.getAllByLabelText("Cerrar menú");
    expect(closeButtons.length).toBe(2);
  });

  it("closes mobile menu on Escape key", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText("Abrir menú"));
    const mobileMenu = screen.getByRole("dialog");
    fireEvent.keyDown(mobileMenu, { key: "Escape" });
    expect(screen.getByLabelText("Abrir menú")).toBeInTheDocument();
  });

  it("renders logo with correct alt text", () => {
    render(<Navbar />);
    const logo = screen.getByAltText("Logo EL LEGADO");
    expect(logo).toBeInTheDocument();
  });

  it("renders brand name", () => {
    render(<Navbar />);
    const brand = screen.getAllByText("EL LEGADO");
    expect(brand.length).toBeGreaterThanOrEqual(1);
  });
});
