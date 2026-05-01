import { useState } from "react";

type Msg = { from: "user" | "ai"; text: string };

export function ChatPanel() {
	const [msgs, setMsgs] = useState<Msg[]>([]);
	const [input, setInput] = useState("");
	const [busy, setBusy] = useState(false);

	async function send() {
		const text = input.trim();
		if (!text || busy) return;
		setMsgs((m) => [...m, { from: "user", text }]);
		setInput("");
		setBusy(true);
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: text }),
			});
			const data = (await res.json()) as { reply?: string };
			setMsgs((m) => [...m, { from: "ai", text: data.reply ?? "..." }]);
		} catch {
			setMsgs((m) => [...m, { from: "ai", text: "Falha ao contatar IA." }]);
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex-1 flex flex-col border-t border-gray-200 dark:border-gray-700 min-h-0">
			<div className="text-xs px-2 py-2 text-left flex items-center gap-2 text-gray-600 dark:text-gray-300">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
				Chat IA
			</div>
			<div className="flex flex-col flex-1 min-h-0 px-2 pb-2 gap-2">
				<div className="flex-1 min-h-32 overflow-auto text-xs space-y-2 border border-gray-200 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-900">
					{msgs.length === 0 ? (
						<div className="text-gray-400">Faça uma pergunta…</div>
					) : (
						msgs.map((m, i) => (
							<div key={i} className={m.from === "user" ? "text-right" : ""}>
								<span
									className={
										m.from === "user"
											? "inline-block bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50 rounded px-2 py-1"
											: "inline-block bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50 rounded px-2 py-1"
									}
								>
									{m.text}
								</span>
							</div>
						))
					)}
				</div>
				<div className="flex gap-1">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") send();
						}}
						placeholder="Pergunte algo…"
						className="flex-1 text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
					/>
					<button
						type="button"
						disabled={busy}
						onClick={send}
						className="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
					>
						{busy ? "…" : "↑"}
					</button>
				</div>
			</div>
		</div>
	);
}
