import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  WIDGET_DEFINITIONS,
  type WidgetType,
} from "../src/editor/widgets/registry";

const screenshotsDir = path.join("e2e", "screenshots");

const widgetSelectors: Record<WidgetType, string> = {
  button: ".widget-button-control",
  checkbox: ".widget-checkbox-control",
  date: ".widget-date-control",
  img: ".widget-img-control, .widget-img-placeholder",
  input: ".widget-input-control",
  label: ".widget-label-control",
  number: ".widget-number-control",
  select: ".widget-select-control",
  tag: ".widget-tag-pill",
  time: ".widget-time-control",
};

async function capture(page: import("@playwright/test").Page, name: string) {
  await mkdir(screenshotsDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotsDir, `${name}.png`),
    fullPage: true,
  });
}

async function insertWidget(
  page: import("@playwright/test").Page,
  keyword: string,
  label: string,
) {
  await page.keyboard.type(keyword);
  const menu = page.locator(".widget-menu");
  await expect(menu).toBeVisible();
  await menu.getByRole("option", { name: new RegExp(label, "i") }).click();
}

type PoemSegment =
  | { kind: "text"; value: string }
  | { kind: "widget"; keyword: string; label: string; type: WidgetType };

async function composePoem(page: import("@playwright/test").Page, segments: PoemSegment[]) {
  for (const segment of segments) {
    if (segment.kind === "text") {
      await page.keyboard.type(segment.value);
      continue;
    }

    await insertWidget(page, segment.keyword, segment.label);
    await expect(page.locator(widgetSelectors[segment.type]).last()).toBeVisible();
  }
}

/** All widgets woven into one stream-of-consciousness thread. */
const incipitPoem: PoemSegment[] = [
  { kind: "text", value: "On " },
  { kind: "widget", keyword: "date", label: "Date", type: "date" },
  { kind: "text", value: " at " },
  { kind: "widget", keyword: "time", label: "Time", type: "time" },
  { kind: "text", value: ", thought " },
  { kind: "widget", keyword: "number", label: "Number", type: "number" },
  { kind: "text", value: " arrives — " },
  { kind: "widget", keyword: "label", label: "Label", type: "label" },
  { kind: "text", value: " the hush, " },
  { kind: "widget", keyword: "input", label: "Input", type: "input" },
  { kind: "text", value: " a vow, tick the " },
  { kind: "widget", keyword: "checkbox", label: "Checkbox", type: "checkbox" },
  { kind: "text", value: ", press " },
  { kind: "widget", keyword: "button", label: "Button", type: "button" },
  { kind: "text", value: " now, " },
  { kind: "widget", keyword: "select", label: "Select", type: "select" },
  { kind: "text", value: " the blue, wear " },
  { kind: "widget", keyword: "tag", label: "Tag", type: "tag" },
  { kind: "text", value: " on the day, glimpse " },
  { kind: "widget", keyword: "img", label: "Image", type: "img" },
  { kind: "text", value: " through." },
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("home page loads with header, tags, and editor", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Stream of Consciousness" })).toBeVisible();
  await expect(page.getByText("Available tags")).toBeVisible();
  await expect(page.locator(".available-tag", { hasText: "button" })).toBeVisible();
  await expect(page.locator(".available-tag", { hasText: "date" })).toBeVisible();
  await expect(page.locator(".stream-content-editable")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Threads" })).toBeVisible();

  await capture(page, "01-home");
});

test("user can write in the editor stream", async ({ page }) => {
  const editor = page.locator(".stream-content-editable");
  await editor.click();
  await page.keyboard.type("A thought flows here.");

  await expect(editor).toContainText("A thought flows here.");
  await capture(page, "02-writing");
});

test("autocomplete inserts a button widget", async ({ page }) => {
  const editor = page.locator(".stream-content-editable");
  await editor.click();
  await page.keyboard.type("but");

  const menu = page.locator(".widget-menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("option", { name: /Button/i })).toBeVisible();

  await capture(page, "03-autocomplete-menu");

  await page.keyboard.press("Enter");
  await expect(page.locator(".widget-button-control")).toBeVisible();
  await expect(page.locator(".widget-button-control")).toHaveText("Action");

  await capture(page, "04-button-widget");
});

test("creates a new thread from the sidebar", async ({ page }) => {
  await page.getByRole("button", { name: "+ New" }).click();
  await expect(page.getByText("Thread 2")).toBeVisible();

  await capture(page, "05-new-thread");
});

test("renders all widget tags in the editor", async ({ page }) => {
  const editor = page.locator(".stream-content-editable");
  await editor.click();

  for (const definition of WIDGET_DEFINITIONS) {
    await insertWidget(page, definition.keyword, definition.label);
    await expect(page.locator(widgetSelectors[definition.type]).last()).toBeVisible();
    await page.keyboard.press("Enter");
  }

  for (const definition of WIDGET_DEFINITIONS) {
    await expect(page.locator(widgetSelectors[definition.type])).toBeVisible();
  }

  await capture(page, "06-all-tags");
});

test("renders a poem with all widget tags in one thread", async ({ page }) => {
  const editor = page.locator(".stream-content-editable");
  await editor.click();

  await composePoem(page, incipitPoem);

  for (const definition of WIDGET_DEFINITIONS) {
    await expect(page.locator(widgetSelectors[definition.type])).toHaveCount(1);
  }

  await expect(page.getByText("Thread 2")).not.toBeVisible();
  await capture(page, "07-poem-all-tags");
});
