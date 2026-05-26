import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "@/components/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("does not render when open is false", () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Test" message="Test msg" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title and message when open", () => {
    render(
      <ConfirmDialog open={true} title="Eliminar Item" message="¿Estás seguro?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText("Eliminar Item")).toBeInTheDocument();
    expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
  });

  it("calls onConfirm when clicking confirm button", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog open={true} title="Test" message="Test msg" onConfirm={onConfirm} onCancel={vi.fn()} />
    );
    fireEvent.click(screen.getByText("Eliminar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when clicking cancel button", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog open={true} title="Test" message="Test msg" onConfirm={vi.fn()} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel on Escape key", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog open={true} title="Test" message="Test msg" onConfirm={vi.fn()} onCancel={onCancel} />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("uses custom button labels", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        message="Test msg"
        confirmLabel="Sí, borrar"
        cancelLabel="No, volver"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Sí, borrar")).toBeInTheDocument();
    expect(screen.getByText("No, volver")).toBeInTheDocument();
  });
});
