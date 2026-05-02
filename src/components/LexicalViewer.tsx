import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM } from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { $getRoot, $insertNodes } from "lexical";
import { ImageNode } from "@/lexical/ImageNode";

const theme = {
	paragraph: "mb-2",
	heading: {
		h1: "text-3xl font-bold mt-3 mb-2",
		h2: "text-2xl font-bold mt-3 mb-2",
		h3: "text-xl font-semibold mt-2 mb-2",
	},
	quote: "border-l-4 border-gray-300 dark:border-gray-700 pl-3 italic text-gray-600 dark:text-gray-400 my-2",
	list: {
		ul: "list-disc pl-6 my-2",
		ol: "list-decimal pl-6 my-2",
		listitem: "ml-2",
		nested: { listitem: "list-none" },
	},
	link: "text-blue-600 underline cursor-pointer",
	code: "bg-gray-100 dark:bg-gray-800 rounded px-1 font-mono text-sm",
	codeHighlight: {},
	text: {
		bold: "font-bold",
		italic: "italic",
		underline: "underline",
		strikethrough: "line-through",
		code: "bg-gray-100 dark:bg-gray-800 rounded px-1 font-mono text-sm",
	},
};

const NODES = [
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	CodeNode,
	CodeHighlightNode,
	LinkNode,
	AutoLinkNode,
	ImageNode,
];

type Props = {
	html: string;
	className?: string;
	emptyLabel?: string;
};

export function LexicalViewer({ html, className, emptyLabel }: Props) {
	const initialConfig = {
		namespace: "FlowerViewer",
		theme,
		nodes: NODES,
		editable: false,
		onError: (e: Error) => console.error(e),
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<RichTextPlugin
				contentEditable={
					<ContentEditable
						className={className ?? "outline-none"}
						aria-readonly
					/>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<ListPlugin />
			<CheckListPlugin />
			<LinkPlugin />
			<InitFromHtml html={html} emptyLabel={emptyLabel} />
		</LexicalComposer>
	);
}

function InitFromHtml({ html, emptyLabel }: { html: string; emptyLabel?: string }) {
	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		const source = html || (emptyLabel ? `<p class="text-slate-400 italic">${emptyLabel}</p>` : "");
		if (!source) return;
		editor.update(() => {
			const parser = new DOMParser();
			const dom = parser.parseFromString(source, "text/html");
			const nodes = $generateNodesFromDOM(editor, dom);
			$getRoot().clear();
			$insertNodes(nodes);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return null;
}
