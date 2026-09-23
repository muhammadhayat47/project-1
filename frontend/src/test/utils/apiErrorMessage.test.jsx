import { describe, it, expect } from "vitest";
import { apiErrorMessage } from "../../api/client";

describe("apiErrorMessage", () => {
  it("prefers the backend's structured detail message", () => {
    const error = { response: { data: { detail: "Invalid credentials" } } };
    expect(apiErrorMessage(error)).toBe("Invalid credentials");
  });

  it("falls back to the raw axios error message when there's no detail", () => {
    const error = { message: "Network Error" };
    expect(apiErrorMessage(error)).toBe("Network Error");
  });

  it("falls back to the given fallback text when nothing else is available", () => {
    expect(apiErrorMessage({}, "Custom fallback")).toBe("Custom fallback");
  });

  it("uses the default fallback when none is supplied and nothing else is available", () => {
    expect(apiErrorMessage({})).toBe("Something went wrong. Please try again.");
  });

  it("prefers detail over message even when both are present", () => {
    const error = { response: { data: { detail: "Detail wins" } }, message: "Message loses" };
    expect(apiErrorMessage(error)).toBe("Detail wins");
  });
});
