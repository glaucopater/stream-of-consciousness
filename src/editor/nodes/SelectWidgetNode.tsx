import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { keepEditorFocusOut } from "../widgets/widgetInteraction";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

const DEFAULT_OPTIONS = ["Option A", "Option B", "Option C"];

export type SerializedSelectWidgetNode = Spread<
  {
    options: string[];
    type: "select-widget";
    version: 1;
  },
  SerializedLexicalNode
>;

function useSelectWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isSelectWidgetNode(node)) {
          setOptions(node.getOptions());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { options };
}

function SelectWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const { options } = useSelectWidgetProps(nodeKey);
  const [value, setValue] = useState(options[0] ?? "");

  useEffect(() => {
    if (!options.includes(value)) {
      setValue(options[0] ?? "");
    }
  }, [options, value]);

  return (
    <WidgetShell nodeKey={nodeKey}>
      <select
        className="widget-select-control"
        value={value}
        onKeyDown={keepEditorFocusOut}
        onMouseDown={keepEditorFocusOut}
        onChange={(event) => setValue(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </WidgetShell>
  );
}

export class SelectWidgetNode extends BaseWidgetNode {
  __options: string[];

  static getType(): string {
    return "select-widget";
  }

  static clone(node: SelectWidgetNode): SelectWidgetNode {
    return new SelectWidgetNode(node.__options, node.__key);
  }

  constructor(options = DEFAULT_OPTIONS, key?: NodeKey) {
    super(key);
    this.__options = options.length > 0 ? options : DEFAULT_OPTIONS;
  }

  static importJSON(serializedNode: SerializedSelectWidgetNode): SelectWidgetNode {
    return new SelectWidgetNode(serializedNode.options);
  }

  exportJSON(): SerializedSelectWidgetNode {
    return {
      ...super.exportJSON(),
      options: this.__options,
      type: "select-widget",
      version: 1,
    };
  }

  getOptions(): string[] {
    return this.getLatest().__options;
  }

  setOptions(options: string[]): void {
    const self = this.getWritable();
    self.__options = options.length > 0 ? options : DEFAULT_OPTIONS;
  }

  createDOM(): HTMLElement {
    const span = super.createDOM();
    span.className = "widget-inline widget-select";
    return span;
  }

  decorate(): ReactNode {
    return <SelectWidget nodeKey={this.__key} />;
  }
}

export function $createSelectWidgetNode(options = DEFAULT_OPTIONS): SelectWidgetNode {
  return new SelectWidgetNode(options);
}

export function $isSelectWidgetNode(
  node: LexicalNode | null | undefined,
): node is SelectWidgetNode {
  return node instanceof SelectWidgetNode;
}
