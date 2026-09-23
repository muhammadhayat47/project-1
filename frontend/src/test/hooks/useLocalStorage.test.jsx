import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useLocalStorage from "../../hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("falls back to the initial value when nothing is stored yet", () => {
    const { result } = renderHook(() => useLocalStorage("careeros-test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("reads an existing value from localStorage instead of the initial value", () => {
    window.localStorage.setItem("careeros-test-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() => useLocalStorage("careeros-test-key", "default"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("persists updates to localStorage as JSON", () => {
    const { result } = renderHook(() => useLocalStorage("careeros-test-key", "default"));
    act(() => result.current[1]("updated"));

    expect(result.current[0]).toBe("updated");
    expect(window.localStorage.getItem("careeros-test-key")).toBe(JSON.stringify("updated"));
  });

  it("supports a functional updater, like useState", () => {
    const { result } = renderHook(() => useLocalStorage("careeros-test-count", 1));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
  });

  it("falls back to the initial value if the stored JSON is corrupt", () => {
    window.localStorage.setItem("careeros-test-key", "{not-valid-json");
    const { result } = renderHook(() => useLocalStorage("careeros-test-key", "default"));
    expect(result.current[0]).toBe("default");
  });
});
