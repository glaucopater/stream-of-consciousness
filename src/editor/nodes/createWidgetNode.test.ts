import { describe, expect, it } from "vitest";
import {
  DateWidgetNode,
  NumberWidgetNode,
  TagWidgetNode,
  TimeWidgetNode,
  createWidgetNode,
} from "./index";
import { $isDateWidgetNode } from "./DateWidgetNode";
import { $isNumberWidgetNode } from "./NumberWidgetNode";
import { $isTimeWidgetNode } from "./TimeWidgetNode";
import { runInEditor } from "../test/testEditor";

describe("createWidgetNode", () => {
  it("creates date, time, and number widget nodes", () => {
    runInEditor(() => {
      expect($isDateWidgetNode(createWidgetNode("date"))).toBe(true);
      expect($isTimeWidgetNode(createWidgetNode("time"))).toBe(true);
      expect($isNumberWidgetNode(createWidgetNode("number"))).toBe(true);
    });
  });

  it("roundtrips serialization for new widget types", () => {
    runInEditor(() => {
      const date = new DateWidgetNode("2026-06-13");
      const restoredDate = DateWidgetNode.importJSON(date.exportJSON());
      expect(restoredDate.getValue()).toBe("2026-06-13");

      const time = new TimeWidgetNode("14:30");
      const restoredTime = TimeWidgetNode.importJSON(time.exportJSON());
      expect(restoredTime.getValue()).toBe("14:30");

      const number = new NumberWidgetNode("42", "7");
      const restoredNumber = NumberWidgetNode.importJSON(number.exportJSON());
      expect(restoredNumber.getPlaceholder()).toBe("42");
      expect(restoredNumber.getValue()).toBe("7");

      const tag = new TagWidgetNode("idea");
      const restoredTag = TagWidgetNode.importJSON(tag.exportJSON());
      expect(restoredTag.getText()).toBe("idea");
    });
  });
});
