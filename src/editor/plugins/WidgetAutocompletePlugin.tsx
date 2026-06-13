import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MenuOption, LexicalTypeaheadMenuPlugin } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $getSelection, $isRangeSelection, $isTextNode, TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { createWidgetNode } from "../nodes";
import {
  matchWidgetDefinitions,
  type WidgetDefinition,
} from "../widgets/registry";
import { WidgetMenu } from "../widgets/WidgetMenu";

class WidgetMenuOption extends MenuOption {
  definition: WidgetDefinition;

  constructor(definition: WidgetDefinition) {
    super(definition.keyword);
    this.definition = definition;
  }
}

const WIDGET_QUERY_REGEX = /(\w+)$/;

function checkForWidgetMatch(text: string) {
  const match = WIDGET_QUERY_REGEX.exec(text);
  if (match === null) {
    return null;
  }

  const matchingString = match[1];
  if (matchingString.length < 2 || matchingString.length > 20) {
    return null;
  }

  return {
    leadOffset: match.index,
    matchingString,
    replaceableString: match[0],
  };
}

function replaceQueryWithWidget(
  selectedOption: WidgetMenuOption,
  nodeToReplace: TextNode | null,
) {
  const widgetNode = createWidgetNode(selectedOption.definition.type);

  if (nodeToReplace && $isTextNode(nodeToReplace)) {
    nodeToReplace.replace(widgetNode);
    return widgetNode;
  }

  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  if (!$isTextNode(anchorNode)) {
    return null;
  }

  const textContent = anchorNode.getTextContent();
  const endOffset = selection.anchor.offset;
  const match = checkForWidgetMatch(textContent.slice(0, endOffset));
  if (!match) {
    return null;
  }

  const startOffset = match.leadOffset;

  if (startOffset === 0 && endOffset === textContent.length) {
    anchorNode.replace(widgetNode);
    return widgetNode;
  }

  if (startOffset === 0) {
    const [, rest] = anchorNode.splitText(endOffset);
    anchorNode.replace(widgetNode);
    widgetNode.insertAfter(rest);
    return widgetNode;
  }

  if (endOffset === textContent.length) {
    const [, replaceable] = anchorNode.splitText(startOffset);
    replaceable.replace(widgetNode);
    return widgetNode;
  }

  const [, replaceable, rest] = anchorNode.splitText(startOffset, endOffset);
  replaceable.replace(widgetNode);
  widgetNode.insertAfter(rest);
  return widgetNode;
}

export function WidgetAutocompletePlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const triggerFn = useCallback((text: string) => checkForWidgetMatch(text), []);

  const options = useMemo(() => {
    if (!queryString) {
      return [];
    }

    return matchWidgetDefinitions(queryString).map(
      (definition) => new WidgetMenuOption(definition),
    );
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: WidgetMenuOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const widgetNode = replaceQueryWithWidget(selectedOption, nodeToReplace);
        if (!widgetNode) {
          closeMenu();
          return;
        }

        widgetNode.selectNext();
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<WidgetMenuOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      options={options}
      triggerFn={triggerFn}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (!anchorElementRef.current || options.length === 0) {
          return null;
        }

        return ReactDOM.createPortal(
          <WidgetMenu
            options={options}
            selectedIndex={selectedIndex}
            setHighlightedIndex={setHighlightedIndex}
            onSelect={(option) => selectOptionAndCleanUp(option)}
          />,
          anchorElementRef.current,
        );
      }}
    />
  );
}
