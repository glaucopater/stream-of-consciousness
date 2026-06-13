import { describe, expect, it } from "vitest";
import {
  DEFAULT_BUTTON_CLICK_ACTION,
  normalizeButtonClickAction,
} from "./buttonActions";

describe("buttonActions", () => {
  it("migrates legacy alert actions to modal", () => {
    expect(
      normalizeButtonClickAction({ type: "alert", message: "Hi" }),
    ).toEqual({ type: "modal", message: "Hi" });
  });

  it("passes through current action types", () => {
    expect(normalizeButtonClickAction({ type: "confirm", message: "Sure?" })).toEqual({
      type: "confirm",
      message: "Sure?",
    });
    expect(normalizeButtonClickAction(DEFAULT_BUTTON_CLICK_ACTION)).toEqual({
      type: "none",
    });
  });
});
