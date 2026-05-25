import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  it("renders page info", () => {
    render(<Pagination page={1} pageSize={10} total={50} onPageChange={() => {}} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("disables previous on first page", () => {
    render(<Pagination page={1} pageSize={10} total={50} onPageChange={() => {}} />);
    const prev = screen.getByRole("button", { name: "Anterior" });
    expect(prev).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination page={5} pageSize={10} total={50} onPageChange={() => {}} />);
    const next = screen.getByRole("button", { name: "Siguiente" });
    expect(next).toBeDisabled();
  });

  it("calls onPageChange when clicking next", async () => {
    const fn = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onPageChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(fn).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange when clicking previous", async () => {
    const fn = vi.fn();
    render(<Pagination page={3} pageSize={10} total={50} onPageChange={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(fn).toHaveBeenCalledWith(2);
  });

  it("renders nothing when total is 0", () => {
    const { container } = render(<Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe("");
  });
});
