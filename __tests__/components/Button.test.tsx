import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button komponenta", () => {
  it("renderuje button sa tekstom", () => {
    render(<Button>Klikni me</Button>);

    expect(screen.getByRole("button")).toHaveTextContent("Klikni me");
  });

  it("poziva onClick handler kada se klikne", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Klikni</Button>);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("primenjuje default varijantu", () => {
    render(<Button>Default</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "default");
  });

  it("primenjuje destructive varijantu", () => {
    render(<Button variant="destructive">Obrisi</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "destructive");
  });

  it("primenjuje outline varijantu", () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "outline");
  });

  it("primenjuje razlicite velicine", () => {
    const { rerender } = render(<Button size="sm">Mali</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");

    rerender(<Button size="lg">Veliki</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon");
  });

  it("moze biti onemogucen (disabled)", () => {
    render(<Button disabled>Onemogucen</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("renderuje kao child element kada je asChild true", () => {
    render(
      <Button asChild>
        <a href="/link">Link Button</a>
      </Button>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Link Button");
    expect(link).toHaveAttribute("href", "/link");
  });

  it("primenjuje custom className", () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });
});
