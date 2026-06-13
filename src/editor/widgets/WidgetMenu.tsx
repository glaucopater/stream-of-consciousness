import type { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { WidgetDefinition } from "./registry";

interface WidgetMenuProps {
  options: Array<MenuOption & { definition: WidgetDefinition }>;
  selectedIndex: number | null;
  setHighlightedIndex: (index: number) => void;
  onSelect: (option: MenuOption & { definition: WidgetDefinition }) => void;
}

export function WidgetMenu({
  options,
  selectedIndex,
  setHighlightedIndex,
  onSelect,
}: WidgetMenuProps) {
  return (
    <div className="widget-menu" role="listbox">
      {options.map((option, index) => (
        <button
          key={option.key}
          className={`widget-menu-item${selectedIndex === index ? " is-selected" : ""}`}
          role="option"
          type="button"
          aria-selected={selectedIndex === index}
          onMouseEnter={() => setHighlightedIndex(index)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(option)}
        >
          <span className="widget-menu-label">{option.definition.label}</span>
          <span className="widget-menu-keyword">{option.definition.keyword}</span>
        </button>
      ))}
    </div>
  );
}
