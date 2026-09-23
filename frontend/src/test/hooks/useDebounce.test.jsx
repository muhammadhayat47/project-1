import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useDebounce from "../../hooks/useDebounce";

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("first", 200));
    expect(result.current).toBe("first");
  });

  it("does not update before the delay has elapsed", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => vi.advanceTimersByTime(100)); // still within the 300ms window
    expect(result.current).toBe("a");

    vi.useRealTimers();
  });

  it("updates to the latest value once the delay has elapsed", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("b");

    vi.useRealTimers();
  });

  it("only reflects the last of several rapid updates (debouncing, not queuing)", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "c" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a"); // the "b" update never got its full 300ms window

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("c");

    vi.useRealTimers();
  });
});
