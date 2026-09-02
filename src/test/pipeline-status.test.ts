import { describe, it, expect } from "vitest";
import { cleanEncodingText } from "@/lib/api/modules/pipeline";

describe("Pipeline Text & Status Utilities", () => {
  it("sanitizes corrupted degree characters and temperatures", () => {
    expect(cleanEncodingText("Lavar a 200c")).toBe("Lavar a 200°C");
    expect(cleanEncodingText("Secar a 100 c")).toBe("Secar a 100°C");
    expect(cleanEncodingText("Algodão 100%")).toBe("Algodão 100%");
  });

  it("handles null, undefined and empty strings gracefully", () => {
    expect(cleanEncodingText(null)).toBe("");
    expect(cleanEncodingText(undefined)).toBe("");
    expect(cleanEncodingText("")).toBe("");
  });

  it("normalizes multiple whitespaces", () => {
    expect(cleanEncodingText("  Vestido    Longo   Feminino  ")).toBe("Vestido Longo Feminino");
  });
});
