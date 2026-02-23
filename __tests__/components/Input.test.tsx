import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input komponenta", () => {
  it("renderuje input element", () => {
    render(<Input />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("prikazuje placeholder tekst", () => {
    render(<Input placeholder="Unesite tekst" />);

    expect(screen.getByPlaceholderText("Unesite tekst")).toBeInTheDocument();
  });

  it("prikazuje vrednost", () => {
    render(<Input value="Test vrednost" onChange={() => {}} />);

    expect(screen.getByDisplayValue("Test vrednost")).toBeInTheDocument();
  });

  it("poziva onChange handler", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "nova vrednost" },
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it("podrzava razlicite tipove", () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    // password nema textbox role
    expect(
      document.querySelector('input[type="password"]'),
    ).toBeInTheDocument();

    rerender(<Input type="number" />);
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("moze biti onemogucen", () => {
    render(<Input disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("moze biti readonly", () => {
    render(<Input readOnly value="Readonly" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("primenjuje custom className", () => {
    render(<Input className="custom-input" />);

    expect(screen.getByRole("textbox").className).toContain("custom-input");
  });

  it("ima data-slot atribut", () => {
    render(<Input />);

    expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input");
  });

  it("podrzava aria atribute za pristupacnost", () => {
    render(
      <Input
        aria-label="Email adresa"
        aria-describedby="email-help"
        aria-invalid={true}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "Email adresa");
    expect(input).toHaveAttribute("aria-describedby", "email-help");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
