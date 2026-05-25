import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/Toast";
import { useEffect } from "react";

function ToastTrigger() {
  const { showToast } = useToast();
  useEffect(() => {
    showToast("Mensaje de prueba", "success");
  }, [showToast]);
  return null;
}

describe("Toast", () => {
  it("renders a toast message when triggered", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    expect(screen.getByText("Mensaje de prueba")).toBeInTheDocument();
  });

  it("removes toast after dismiss", async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    expect(screen.getByText("Mensaje de prueba")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.queryByText("Mensaje de prueba")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
