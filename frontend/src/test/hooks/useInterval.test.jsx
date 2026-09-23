import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInterval from "../../hooks/useInterval";

describe("useInterval", () => {
  it("calls the callback repeatedly at the given delay", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(2000));
    expect(callback).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });

  it("does not start a timer when delay is null (paused)", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));

    act(() => vi.advanceTimersByTime(5000));
    expect(callback).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("always calls the latest callback without restarting the timer", () => {
    vi.useFakeTimers();
    let calls = [];
    const makeCallback = (label) => () => calls.push(label);

    const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
      initialProps: { cb: makeCallback("first") },
    });

    act(() => vi.advanceTimersByTime(1000));
    rerender({ cb: makeCallback("second") });
    act(() => vi.advanceTimersByTime(1000));

    expect(calls).toEqual(["first", "second"]);
    vi.useRealTimers();
  });
});
