import { describe, expect, it } from "vitest";
import {
  WIDGET_DEFINITIONS,
  matchWidgetDefinitions,
} from "./registry";

describe("widget registry", () => {
  it("includes date, time, and number tags", () => {
    const keywords = WIDGET_DEFINITIONS.map((definition) => definition.keyword);
    expect(keywords).toContain("date");
    expect(keywords).toContain("time");
    expect(keywords).toContain("number");
  });

  it("matches keywords by prefix", () => {
    expect(matchWidgetDefinitions("dat")).toEqual([
      { keyword: "date", label: "Date", type: "date" },
    ]);
    expect(matchWidgetDefinitions("num")).toEqual([
      { keyword: "number", label: "Number", type: "number" },
    ]);
    expect(matchWidgetDefinitions("tim")).toEqual([
      { keyword: "time", label: "Time", type: "time" },
    ]);
  });

  it("returns empty list when nothing matches", () => {
    expect(matchWidgetDefinitions("xyz")).toEqual([]);
  });
});
