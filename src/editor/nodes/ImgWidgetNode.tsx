import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { useEffect, useState } from "react";
import { WidgetShell } from "../widgets/WidgetShell";
import { getRandomUnsplashImage } from "../widgets/unsplashImages";
import { BaseWidgetNode } from "./BaseWidgetNode";

import type { LexicalNode, SerializedLexicalNode, Spread } from "lexical";
import type { ReactNode } from "react";

export type SerializedImgWidgetNode = Spread<
  {
    alt: string;
    src: string;
    type: "img-widget";
    version: 1;
  },
  SerializedLexicalNode
>;

function useImgWidgetProps(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("Image");

  useEffect(() => {
    const readProps = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImgWidgetNode(node)) {
          setSrc(node.getSrc());
          setAlt(node.getAlt());
        }
      });
    };

    readProps();
    return editor.registerUpdateListener(() => readProps());
  }, [editor, nodeKey]);

  return { alt, src };
}

function ImgWidget({ nodeKey }: { nodeKey: NodeKey }) {
  const { src, alt } = useImgWidgetProps(nodeKey);

  return (
    <WidgetShell nodeKey={nodeKey}>
      {src ? (
        <img alt={alt} className="widget-img-control" src={src} />
      ) : (
        <span className="widget-img-placeholder">{alt}</span>
      )}
    </WidgetShell>
  );
}

export class ImgWidgetNode extends BaseWidgetNode {
  __alt: string;
  __src: string;

  static getType(): string {
    return "img-widget";
  }

  static clone(node: ImgWidgetNode): ImgWidgetNode {
    return new ImgWidgetNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, alt: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  static importJSON(serializedNode: SerializedImgWidgetNode): ImgWidgetNode {
    return new ImgWidgetNode(serializedNode.src ?? "", serializedNode.alt || "Image");
  }

  exportJSON(): SerializedImgWidgetNode {
    return {
      ...super.exportJSON(),
      alt: this.__alt,
      src: this.__src,
      type: "img-widget",
      version: 1,
    };
  }

  getSrc(): string {
    return this.getLatest().__src;
  }

  setSrc(src: string): void {
    const self = this.getWritable();
    self.__src = src;
  }

  getAlt(): string {
    return this.getLatest().__alt;
  }

  setAlt(alt: string): void {
    const self = this.getWritable();
    self.__alt = alt;
  }

  createDOM(): HTMLElement {
    const span = super.createDOM();
    span.className = "widget-inline widget-img";
    return span;
  }

  decorate(): ReactNode {
    return <ImgWidget nodeKey={this.__key} />;
  }
}

export function $createImgWidgetNode(): ImgWidgetNode {
  const { src, alt } = getRandomUnsplashImage();
  return new ImgWidgetNode(src, alt);
}

export function $isImgWidgetNode(
  node: LexicalNode | null | undefined,
): node is ImgWidgetNode {
  return node instanceof ImgWidgetNode;
}
