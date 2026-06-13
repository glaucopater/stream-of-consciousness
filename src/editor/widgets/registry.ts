export type WidgetType =
  | "button"
  | "checkbox"
  | "date"
  | "img"
  | "input"
  | "label"
  | "number"
  | "select"
  | "tag"
  | "time";

export interface WidgetDefinition {
  keyword: string;
  label: string;
  type: WidgetType;
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  { keyword: "button", label: "Button", type: "button" },
  { keyword: "checkbox", label: "Checkbox", type: "checkbox" },
  { keyword: "date", label: "Date", type: "date" },
  { keyword: "img", label: "Image", type: "img" },
  { keyword: "input", label: "Input", type: "input" },
  { keyword: "label", label: "Label", type: "label" },
  { keyword: "number", label: "Number", type: "number" },
  { keyword: "select", label: "Select", type: "select" },
  { keyword: "tag", label: "Tag", type: "tag" },
  { keyword: "time", label: "Time", type: "time" },
];

export function matchWidgetDefinitions(query: string): WidgetDefinition[] {
  const normalized = query.toLowerCase();
  return WIDGET_DEFINITIONS.filter((definition) =>
    definition.keyword.startsWith(normalized),
  );
}
