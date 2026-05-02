// Nó de imagem mínimo para o Lexical: serializa para <img> no HTML, importa de <img>.
// Inspirado no playground oficial: https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/nodes/ImageNode.tsx
import type { ReactNode } from "react";
import {
	DecoratorNode,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalEditor,
	type LexicalNode,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread,
} from "lexical";

export type SerializedImageNode = Spread<
	{ src: string; alt: string; fileId?: string },
	SerializedLexicalNode
>;

function convertImage(domNode: HTMLElement): DOMConversionOutput {
	if (!(domNode instanceof HTMLImageElement)) return { node: null };
	const src = domNode.getAttribute("src") || "";
	const alt = domNode.getAttribute("alt") || "";
	const fileId = domNode.getAttribute("data-file-id") || undefined;
	return { node: $createImageNode({ src, alt, fileId }) };
}

export class ImageNode extends DecoratorNode<ReactNode> {
	__src: string;
	__alt: string;
	__fileId?: string;

	static getType(): string {
		return "image";
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(node.__src, node.__alt, node.__fileId, node.__key);
	}

	constructor(src: string, alt: string, fileId?: string, key?: NodeKey) {
		super(key);
		this.__src = src;
		this.__alt = alt;
		this.__fileId = fileId;
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const span = document.createElement("span");
		span.style.display = "inline-block";
		span.style.maxWidth = "100%";
		return span;
	}

	updateDOM(): false {
		return false;
	}

	decorate(_editor: LexicalEditor): ReactNode {
		return (
			<img
				src={this.__src}
				alt={this.__alt}
				data-file-id={this.__fileId}
				style={{ maxWidth: "100%", height: "auto", borderRadius: 4, display: "block" }}
			/>
		);
	}

	exportDOM(): DOMExportOutput {
		const el = document.createElement("img");
		el.setAttribute("src", this.__src);
		el.setAttribute("alt", this.__alt);
		if (this.__fileId) el.setAttribute("data-file-id", this.__fileId);
		return { element: el };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			img: () => ({ conversion: convertImage, priority: 0 }),
		};
	}

	exportJSON(): SerializedImageNode {
		return {
			type: "image",
			version: 1,
			src: this.__src,
			alt: this.__alt,
			fileId: this.__fileId,
		};
	}

	static importJSON(serialized: SerializedImageNode): ImageNode {
		return $createImageNode({
			src: serialized.src,
			alt: serialized.alt,
			fileId: serialized.fileId,
		});
	}

	isInline(): boolean {
		return true;
	}
}

export function $createImageNode({
	src,
	alt,
	fileId,
}: {
	src: string;
	alt: string;
	fileId?: string;
}): ImageNode {
	return new ImageNode(src, alt, fileId);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
	return node instanceof ImageNode;
}
