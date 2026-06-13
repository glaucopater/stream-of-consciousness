import { describe, expect, it } from "vitest";
import { TagWidgetNode } from "../nodes";
import { runInEditor } from "../test/testEditor";
import {
  createWidgetFromPayload,
  decodeWidgetClipboard,
  encodeWidgetClipboard,
} from "./widgetClipboard";

describe("widgetClipboard", () => {
  it("encodes and decodes widget payloads", () => {
    runInEditor(() => {
      const node = new TagWidgetNode("stream");
      const payload = node.exportJSON();
      const encoded = encodeWidgetClipboard(payload);
      const decoded = decodeWidgetClipboard(encoded);

      expect(decoded).toEqual(payload);
      expect(createWidgetFromPayload(decoded!)).toBeInstanceOf(TagWidgetNode);
    });
  });

  it("rejects non-widget clipboard text", () => {
    expect(decodeWidgetClipboard("hello")).toBeNull();
    expect(decodeWidgetClipboard("incipit:widget:{}")).toBeNull();
  });
});
