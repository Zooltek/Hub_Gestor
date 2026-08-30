import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { MOCK_SALES_KPIS } from "@/lib/api/mock-data";

describe("KPI Calculations & Formatting", () => {
  it("formats BRL currency correctly", () => {
    expect(formatCurrency(248650)).toContain("248.650");
    expect(formatCurrency(175.1)).toContain("175,10");
  });

  it("calculates percentage changes correctly", () => {
    const rev = MOCK_SALES_KPIS.revenue;
    const computedChange = ((rev.current - rev.previous) / rev.previous) * 100;
    expect(computedChange).toBeCloseTo(15.01, 1);
    expect(formatPercent(15.01)).toBe("+15,0%");
    expect(formatPercent(-3.2)).toBe("-3,2%");
  });

  it("formats large numbers correctly", () => {
    expect(formatNumber(1420)).toContain("1.420");
    expect(formatNumber(3120)).toContain("3.120");
  });
});
