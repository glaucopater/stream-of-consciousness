import { WIDGET_DEFINITIONS } from "../editor/widgets/registry";

export function AvailableTags() {
  return (
    <div className="available-tags">
      <span className="available-tags-label">Available tags</span>
      <ul className="available-tags-list">
        {WIDGET_DEFINITIONS.map((definition) => (
          <li key={definition.type}>
            <span className="available-tag" title={definition.label}>
              {definition.keyword}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
