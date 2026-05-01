import { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
	ListNode,
	ListItemNode,
	INSERT_UNORDERED_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_CHECK_LIST_COMMAND,
	REMOVE_LIST_COMMAND,
	$isListNode,
} from "@lexical/list";
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister, $getNearestNodeOfType } from "@lexical/utils";
import { TRANSFORMERS } from "@lexical/markdown";
import { $createImageNode, ImageNode } from "./lexical/ImageNode";
import {
	$createParagraphNode,
	$getRoot,
	$getSelection,
	$insertNodes,
	$isRangeSelection,
	$isRootOrShadowRoot,
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
	type ElementFormatType,
	type TextFormatType,
} from "lexical";

type Props = {
	name: string;
	defaultHtml?: string;
	placeholder?: string;
	tall?: boolean;
	uploadContext?: { processId: string; stepId: string };
	onUploaded?: (file: UploadedFile) => void;
};

export type UploadedFile = {
	id: string;
	name: string;
	mime_type: string;
	size_bytes: number;
	is_image: number;
	url: string;
};

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

export function LexicalEditor({
	name,
	defaultHtml = "",
	placeholder = "Escreva aqui…",
	tall = false,
	uploadContext,
	onUploaded,
}: Props) {
	const [html, setHtml] = useState(defaultHtml);
	const [maximized, setMaximized] = useState(false);
	const [showSource, setShowSource] = useState(false);

	const initialConfig = {
		namespace: "FlowerEditor",
		theme,
		nodes: NODES,
		onError: (e: Error) => console.error(e),
	};

	const wrapClasses = maximized
		? "fixed inset-0 z-50 bg-white dark:bg-gray-950 p-4 flex flex-col"
		: tall
			? "relative border border-gray-300 dark:border-gray-700 rounded flex flex-col flex-1 min-h-0"
			: "relative border border-gray-300 dark:border-gray-700 rounded flex flex-col";

	const editableClasses = maximized
		? "flex-1 overflow-auto outline-none px-4 py-3 prose dark:prose-invert max-w-none"
		: tall
			? "flex-1 min-h-0 overflow-auto outline-none px-3 py-2 prose dark:prose-invert max-w-none"
			: "min-h-64 outline-none px-3 py-2 prose dark:prose-invert max-w-none";

	return (
		<div className={wrapClasses}>
			<LexicalComposer initialConfig={initialConfig}>
				<Toolbar
					maximized={maximized}
					onToggleMaximize={() => setMaximized((v) => !v)}
					uploadContext={uploadContext}
					onUploaded={onUploaded}
					showSource={showSource}
					onToggleSource={() => setShowSource((v) => !v)}
				/>
				<input type="hidden" name={name} value={html} />
				<div className="relative flex-1 min-h-0 flex flex-col">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className={
									editableClasses + (showSource ? " hidden" : "")
								}
								aria-placeholder={placeholder}
								placeholder={
									<div className="absolute top-2 left-3 text-gray-400 pointer-events-none select-none">
										{placeholder}
									</div>
								}
							/>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					{showSource ? (
						<pre
							className={
								(maximized
									? "flex-1 overflow-auto px-4 py-3"
									: tall
										? "flex-1 min-h-0 overflow-auto px-3 py-2"
										: "min-h-64 overflow-auto px-3 py-2") +
								" text-xs font-mono whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
							}
						>
							{html || "(vazio)"}
						</pre>
					) : null}
					{uploadContext && !showSource ? (
						<DropZone uploadContext={uploadContext} onUploaded={onUploaded} />
					) : null}
				</div>
				<HistoryPlugin />
				<ListPlugin />
				<CheckListPlugin />
				<LinkPlugin />
				<TabIndentationPlugin />
				<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
				<InitFromHtml html={defaultHtml} />
				<OnChangePlugin
					onChange={(_state, editor) => {
						editor.update(() => {
							const out = $generateHtmlFromNodes(editor, null);
							setHtml(out);
						});
					}}
				/>
			</LexicalComposer>
		</div>
	);
}

async function uploadFile(
	file: File,
	uploadContext: { processId: string; stepId: string }
): Promise<UploadedFile> {
	const fd = new FormData();
	fd.append("file", file);
	fd.append("process_id", uploadContext.processId);
	fd.append("step_id", uploadContext.stepId);
	const res = await fetch("/api/files", { method: "POST", body: fd });
	const json = (await res.json()) as { ok: boolean; error?: string; file?: UploadedFile };
	if (!json.ok || !json.file) {
		throw new Error(json.error || "upload failed");
	}
	return json.file;
}

function DropZone({
	uploadContext,
	onUploaded,
}: {
	uploadContext: { processId: string; stepId: string };
	onUploaded?: (f: UploadedFile) => void;
}) {
	const [editor] = useLexicalComposerContext();
	const [over, setOver] = useState(false);
	const [busy, setBusy] = useState(false);

	async function onDrop(e: React.DragEvent) {
		e.preventDefault();
		setOver(false);
		const files = Array.from(e.dataTransfer.files);
		if (files.length === 0) return;
		setBusy(true);
		try {
			for (const f of files) {
				const up = await uploadFile(f, uploadContext);
				if (up.is_image) insertImageInEditor(editor, up);
				onUploaded?.(up);
			}
		} catch (err) {
			alert("Falha no upload: " + (err as Error).message);
		} finally {
			setBusy(false);
		}
	}

	if (!over && !busy) {
		return (
			<div
				className="absolute inset-0 pointer-events-none"
				onDragEnter={() => setOver(true)}
			>
				<div
					className="absolute inset-0 pointer-events-auto"
					style={{ background: "transparent" }}
					onDragEnter={(e) => {
						e.preventDefault();
						setOver(true);
					}}
					onDragOver={(e) => {
						e.preventDefault();
					}}
					onDrop={onDrop}
				/>
			</div>
		);
	}

	return (
		<div
			className="absolute inset-0 z-20 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/40 border-2 border-dashed border-blue-400 rounded pointer-events-auto"
			onDragOver={(e) => e.preventDefault()}
			onDragLeave={() => setOver(false)}
			onDrop={onDrop}
		>
			<div className="text-blue-900 dark:text-blue-100 text-sm">
				{busy ? "Enviando…" : "Solte para anexar"}
			</div>
		</div>
	);
}

function insertImageInEditor(editor: ReturnType<typeof useLexicalComposerContext>[0], up: UploadedFile) {
	editor.update(() => {
		const sel = $getSelection();
		const node = $createImageNode({ src: up.url, alt: up.name, fileId: up.id });
		if ($isRangeSelection(sel)) {
			sel.insertNodes([node]);
		} else {
			$getRoot().append($createParagraphNode().append(node));
		}
	});
}

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "code" | "ul" | "ol" | "check";

const BLOCK_LABELS: Record<BlockType, string> = {
	paragraph: "Parágrafo",
	h1: "Título 1",
	h2: "Título 2",
	h3: "Título 3",
	quote: "Citação",
	code: "Bloco de código",
	ul: "Lista",
	ol: "Lista numerada",
	check: "Lista de tarefas",
};

function Toolbar({
	maximized,
	onToggleMaximize,
	uploadContext,
	onUploaded,
	showSource,
	onToggleSource,
}: {
	maximized: boolean;
	onToggleMaximize: () => void;
	uploadContext?: { processId: string; stepId: string };
	onUploaded?: (f: UploadedFile) => void;
	showSource: boolean;
	onToggleSource: () => void;
}) {
	const [editor] = useLexicalComposerContext();
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const [activeFormats, setActiveFormats] = useState<Record<TextFormatType, boolean>>({} as Record<TextFormatType, boolean>);
	const [blockType, setBlockType] = useState<BlockType>("paragraph");
	const [isLink, setIsLink] = useState(false);
	const [align, setAlign] = useState<ElementFormatType>("left");

	const updateState = useCallback(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) return;

		const formats: Record<string, boolean> = {};
		for (const f of ["bold", "italic", "underline", "strikethrough", "code"] as TextFormatType[]) {
			formats[f] = selection.hasFormat(f);
		}
		setActiveFormats(formats as Record<TextFormatType, boolean>);

		const anchorNode = selection.anchor.getNode();
		const element =
			anchorNode.getKey() === "root"
				? anchorNode
				: $isRootOrShadowRoot(anchorNode)
					? anchorNode
					: anchorNode.getTopLevelElementOrThrow();

		const elementKey = element.getKey();
		const elementDOM = editor.getElementByKey(elementKey);

		const parent = anchorNode.getParent();
		setIsLink($isLinkNode(parent) || $isLinkNode(anchorNode));

		if (elementDOM !== null) {
			if ($isListNode(element)) {
				const parentList = $getNearestNodeOfType(anchorNode, ListNode);
				const tag = parentList ? parentList.getListType() : element.getListType();
				if (tag === "check") setBlockType("check");
				else if (tag === "number") setBlockType("ol");
				else setBlockType("ul");
			} else {
				const tag = element.getType();
				if (tag === "heading") {
					const level = (element as { getTag?: () => string }).getTag?.() ?? "h1";
					setBlockType((["h1", "h2", "h3"].includes(level) ? level : "h1") as BlockType);
				} else if (tag === "quote") setBlockType("quote");
				else if (tag === "code") setBlockType("code");
				else setBlockType("paragraph");
			}
		}

		const fmt = (element as { getFormatType?: () => ElementFormatType }).getFormatType?.() ?? "left";
		setAlign(fmt || "left");
	}, [editor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => updateState());
			}),
			editor.registerCommand(
				CAN_UNDO_COMMAND,
				(payload) => {
					setCanUndo(payload);
					return false;
				},
				1
			),
			editor.registerCommand(
				CAN_REDO_COMMAND,
				(payload) => {
					setCanRedo(payload);
					return false;
				},
				1
			)
		);
	}, [editor, updateState]);

	function applyBlock(type: BlockType) {
		editor.update(() => {
			const sel = $getSelection();
			if (!$isRangeSelection(sel)) return;
			if (type === "paragraph") {
				$setBlocksType(sel, () => $createParagraphNode());
			} else if (type === "h1" || type === "h2" || type === "h3") {
				$setBlocksType(sel, () => $createHeadingNode(type));
			} else if (type === "quote") {
				$setBlocksType(sel, () => $createQuoteNode());
			} else if (type === "code") {
				$setBlocksType(sel, () => $createCodeNode());
			}
		});
		if (type === "ul") {
			if (blockType === "ul") editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
			else editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
		} else if (type === "ol") {
			if (blockType === "ol") editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
			else editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
		} else if (type === "check") {
			if (blockType === "check") editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
			else editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
		}
	}

	function format(t: TextFormatType) {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, t);
	}
	function alignTo(a: ElementFormatType) {
		editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, a);
	}
	function toggleLink() {
		if (isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
			return;
		}
		const url = prompt("URL do link (ex: https://exemplo.com):", "https://");
		if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
	}
	function clearFormatting() {
		editor.update(() => {
			const sel = $getSelection();
			if (!$isRangeSelection(sel)) return;
			for (const f of ["bold", "italic", "underline", "strikethrough", "code"] as TextFormatType[]) {
				if (sel.hasFormat(f)) editor.dispatchCommand(FORMAT_TEXT_COMMAND, f);
			}
			$setBlocksType(sel, () => $createParagraphNode());
		});
	}

	return (
		<div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs">
			<TbBtn label="Desfazer" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} disabled={!canUndo}>
				↶
			</TbBtn>
			<TbBtn label="Refazer" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} disabled={!canRedo}>
				↷
			</TbBtn>
			<Sep />
			<select
				value={blockType}
				onChange={(e) => applyBlock(e.target.value as BlockType)}
				className="text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded px-1 py-1"
				title="Estilo do bloco"
			>
				{(Object.keys(BLOCK_LABELS) as BlockType[]).map((b) => (
					<option key={b} value={b}>
						{BLOCK_LABELS[b]}
					</option>
				))}
			</select>
			<Sep />
			<TbBtn label="Negrito (Ctrl+B)" active={!!activeFormats.bold} onClick={() => format("bold")}>
				<b>B</b>
			</TbBtn>
			<TbBtn label="Itálico (Ctrl+I)" active={!!activeFormats.italic} onClick={() => format("italic")}>
				<i>I</i>
			</TbBtn>
			<TbBtn label="Sublinhado (Ctrl+U)" active={!!activeFormats.underline} onClick={() => format("underline")}>
				<u>U</u>
			</TbBtn>
			<TbBtn label="Tachado" active={!!activeFormats.strikethrough} onClick={() => format("strikethrough")}>
				<s>S</s>
			</TbBtn>
			<TbBtn label="Código inline" active={!!activeFormats.code} onClick={() => format("code")}>
				{"</>"}
			</TbBtn>
			<Sep />
			<TbBtn label={isLink ? "Remover link" : "Inserir link"} active={isLink} onClick={toggleLink}>
				🔗
			</TbBtn>
			<Sep />
			<TbBtn label="Alinhar à esquerda" active={align === "left"} onClick={() => alignTo("left")}>
				⇤
			</TbBtn>
			<TbBtn label="Centralizar" active={align === "center"} onClick={() => alignTo("center")}>
				≡
			</TbBtn>
			<TbBtn label="Alinhar à direita" active={align === "right"} onClick={() => alignTo("right")}>
				⇥
			</TbBtn>
			<TbBtn label="Justificar" active={align === "justify"} onClick={() => alignTo("justify")}>
				☰
			</TbBtn>
			<Sep />
			<TbBtn label="Limpar formatação" onClick={clearFormatting}>
				⌫
			</TbBtn>
			{uploadContext ? (
				<>
					<Sep />
					<UploadBtn uploadContext={uploadContext} onUploaded={onUploaded} editor={editor} />
				</>
			) : null}
			<div className="flex-1" />
			<TbBtn
				label={showSource ? "Voltar para o editor" : "Ver código HTML"}
				active={showSource}
				onClick={onToggleSource}
			>
				{"<>"}
			</TbBtn>
			<TbBtn label={maximized ? "Minimizar" : "Maximizar"} onClick={onToggleMaximize}>
				{maximized ? "✕" : "⛶"}
			</TbBtn>
		</div>
	);
}

function UploadBtn({
	uploadContext,
	onUploaded,
	editor,
}: {
	uploadContext: { processId: string; stepId: string };
	onUploaded?: (f: UploadedFile) => void;
	editor: ReturnType<typeof useLexicalComposerContext>[0];
}) {
	const [busy, setBusy] = useState(false);
	const inputId = `lex-upload-${uploadContext.stepId}`;

	async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? []);
		if (files.length === 0) return;
		setBusy(true);
		try {
			for (const f of files) {
				const up = await uploadFile(f, uploadContext);
				if (up.is_image) insertImageInEditor(editor, up);
				onUploaded?.(up);
			}
		} catch (err) {
			alert("Falha no upload: " + (err as Error).message);
		} finally {
			setBusy(false);
			e.target.value = "";
		}
	}

	return (
		<>
			<input
				id={inputId}
				type="file"
				multiple
				className="hidden"
				onChange={onChange}
				disabled={busy}
			/>
			<label
				htmlFor={inputId}
				title={busy ? "Enviando…" : "Anexar imagem ou arquivo"}
				className={
					"min-w-7 h-7 px-1.5 rounded text-xs flex items-center justify-center border border-transparent " +
					(busy
						? "opacity-50 cursor-wait"
						: "hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer")
				}
			>
				{busy ? "⏳" : "📎"}
			</label>
		</>
	);
}

function TbBtn({
	children,
	onClick,
	active,
	disabled,
	label,
}: {
	children: React.ReactNode;
	onClick: () => void;
	active?: boolean;
	disabled?: boolean;
	label: string;
}) {
	return (
		<button
			type="button"
			title={label}
			aria-label={label}
			disabled={disabled}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onClick}
			className={
				"min-w-7 h-7 px-1.5 rounded text-xs flex items-center justify-center border " +
				(disabled
					? "opacity-30 cursor-not-allowed border-transparent"
					: active
						? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-50 border-blue-200 dark:border-blue-800"
						: "border-transparent hover:bg-gray-200 dark:hover:bg-gray-800")
			}
		>
			{children}
		</button>
	);
}

function Sep() {
	return <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />;
}

function InitFromHtml({ html }: { html: string }) {
	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		if (!html) return;
		editor.update(() => {
			const parser = new DOMParser();
			const dom = parser.parseFromString(html, "text/html");
			const nodes = $generateNodesFromDOM(editor, dom);
			$getRoot().clear();
			$insertNodes(nodes);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return null;
}
