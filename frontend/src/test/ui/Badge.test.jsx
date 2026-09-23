import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../../components/ui/Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>High risk</Badge>);
    expect(screen.getByText("High risk")).toBeInTheDocument();
  });

  it("defaults to the neutral tone class", () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText("Neutral")).toHaveClass("bg-white/10");
  });

  it("applies the requested tone", () => {
    render(<Badge tone="high">Danger</Badge>);
    expect(screen.getByText("Danger")).toHaveClass("text-red-300");
  });

  it("falls back gracefully for an unknown tone rather than crashing", () => {
    // TONES[tone] is undefined for an unrecognised tone — the component
    // should still render the children instead of throwing.
    render(<Badge tone="not-a-real-tone">Still visible</Badge>);
    expect(screen.getByText("Still visible")).toBeInTheDocument();
  });
});
