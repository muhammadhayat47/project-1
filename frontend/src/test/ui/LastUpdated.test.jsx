import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LastUpdated from "../../components/ui/LastUpdated";

describe("LastUpdated", () => {
  it("renders nothing when there is no timestamp yet", () => {
    const { container } = render(<LastUpdated timestamp={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows 'just now' immediately after the timestamp", () => {
    render(<LastUpdated timestamp={Date.now()} />);
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it("shows elapsed seconds once enough time has passed", () => {
    vi.useFakeTimers();
    const tenSecondsAgo = Date.now() - 10_000;
    render(<LastUpdated timestamp={tenSecondsAgo} />);
    expect(screen.getByText(/10s ago/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("spins the refresh icon while refreshing is true", () => {
    render(<LastUpdated timestamp={Date.now()} refreshing />);
    const icon = document.querySelector("svg");
    expect(icon).toHaveClass("animate-spin");
  });
});
