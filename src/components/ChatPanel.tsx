import { useState } from "react";
import { Button } from "./ui/button";

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
		<div className="flex-1 flex flex-col border-t border-slate-200 dark:border-slate-800 min-h-0">
			<div className="px-3 py-2 flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="text-slate-400"
				>
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
				<span className="text-xs font-medium text-slate-500 dark:text-slate-400">Chat IA</span>
			</div>

			<div className="flex flex-col flex-1 min-h-0 px-3 pb-3 gap-2">
				<div className="flex-1 min-h-32 overflow-auto text-xs space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-900">
					{msgs.length === 0 ? (
						<p className="text-slate-400 dark:text-slate-500 text-center mt-4">
							Faça uma pergunta…
						</p>
					) : (
						msgs.map((m, i) => (
							<div key={i} className={m.from === "user" ? "text-right" : ""}>
								<span
									className={
										m.from === "user"
											? "inline-block bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 rounded-lg px-2.5 py-1.5 max-w-[85%]"
											: "inline-block bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-50 rounded-lg px-2.5 py-1.5 max-w-[85%] border border-slate-200 dark:border-slate-700"
									}
								>
									{m.text}
								</span>
							</div>
						))
					)}
					{busy && (
						<div>
							<span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-400">
								<span className="animate-bounce">·</span>
								<span className="animate-bounce delay-75">·</span>
								<span className="animate-bounce delay-150">·</span>
							</span>
						</div>
					)}
				</div>

				<div className="flex gap-1.5">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) send();
						}}
						placeholder="Pergunte algo…"
						className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-300"
					/>
					<Button
						type="button"
						size="sm"
						disabled={busy || !input.trim()}
						onClick={send}
						className="h-7 w-7 p-0 text-xs"
					>
						↑
					</Button>
				</div>
			</div>
		</div>
	);
}
