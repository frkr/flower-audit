import { useEffect, useState } from "react";
import { Form, Link } from "react-router";
import type { Route } from "./+types/go";
import { useSearch } from "@/SearchContext";
import { systemNameFromMatches } from "../../lib/systemName";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { cn } from "../../lib/utils";

export { loader } from "./go.server";

export function meta({ matches }: Route.MetaArgs) {
	return [
		{ title: `${systemNameFromMatches(matches)} — Começar` },
		{ name: "description", content: "Pesquise fluxos e processos" },
	];
}

type Hit = { id: string; name: string; description: string; kind: "flux" | "process" };

export default function Comecar({}: Route.ComponentProps) {
	const { collapsed, setCollapsed, query, setQuery } = useSearch();
	const [hits, setHits] = useState<Hit[]>([]);
	const [phase, setPhase] = useState<"idle" | "flux" | "process" | "done">("idle");

	async function runSearch(q: string) {
		setHits([]);
		setPhase("flux");
		const fluxRes = await fetch(`/api/search?phase=flux&q=${encodeURIComponent(q)}`);
		const fluxJson = (await fluxRes.json()) as { hits: Hit[] };
		setHits(fluxJson.hits);
		setPhase("process");
		const procRes = await fetch(`/api/search?phase=process&q=${encodeURIComponent(q)}`);
		const procJson = (await procRes.json()) as { hits: Hit[] };
		setHits((prev) => [...prev, ...procJson.hits]);
		setPhase("done");
	}

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const q = query.trim();
		if (!q) return;
		setCollapsed(true);
		runSearch(q);
	}

	useEffect(() => {
		return () => setCollapsed(false);
	}, [setCollapsed]);

	return (
		<div className="h-full">
			<form
				onSubmit={onSubmit}
				className={cn(
					"transition-all duration-500 ease-out",
					collapsed ? "w-80" : "max-w-2xl mx-auto mt-24 w-full"
				)}
			>
				<div className={cn("flex gap-2 items-center", !collapsed && "flex-col sm:flex-row")}>
					{!collapsed && (
						<p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-1 w-full">
							Pesquise em fluxos e processos
						</p>
					)}
					<div className="flex gap-2 w-full">
						<input
							autoFocus
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Pesquisar fluxos e processos…"
							className={cn(
								"flex-1 rounded-full border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500",
								collapsed
									? "text-sm px-3 py-1.5 focus:ring-1 focus:ring-slate-300"
									: "text-base px-5 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							)}
						/>
						<button
							type="submit"
							className={cn(
								"rounded-full font-medium transition-colors",
								collapsed
									? "text-xs px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900"
									: "px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 text-sm"
							)}
						>
							{collapsed ? "↑" : "Pesquisar"}
						</button>
					</div>
				</div>
			</form>

			{collapsed ? (
				<section className="mt-6 max-w-3xl">
					<div className="flex items-center justify-between mb-3">
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{phase === "flux"
								? "Buscando em fluxos…"
								: phase === "process"
									? "Buscando em processos…"
									: phase === "done"
										? `${hits.length} resultado${hits.length !== 1 ? "s" : ""}`
										: ""}
						</p>
						{phase !== "idle" && phase !== "done" && (
							<span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
								<span className="animate-spin w-3 h-3 border border-slate-400 border-t-transparent rounded-full" />
								Buscando…
							</span>
						)}
					</div>

					<ul className="space-y-2">
						{hits.map((h) => (
							<li
								key={`${h.kind}:${h.id}`}
								className="group border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-start gap-3 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow"
							>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2 mb-1">
										<Badge variant={h.kind === "flux" ? "secondary" : "outline"}>
											{h.kind === "flux" ? "Fluxo" : "Processo"}
										</Badge>
									</div>
									<Link
										to={h.kind === "flux" ? `/flow/${h.id}` : `/process/${h.id}`}
										className="text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
									>
										{h.name}
									</Link>
									{h.description ? (
										<p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
											{h.description}
										</p>
									) : null}
								</div>
								{h.kind === "flux" ? (
									<Form method="post" action="/process">
										<input type="hidden" name="intent" value="startFromFlow" />
										<input type="hidden" name="id_fluxo" value={h.id} />
										<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
											▶ Iniciar
										</Button>
									</Form>
								) : null}
							</li>
						))}
						{phase === "done" && hits.length === 0 ? (
							<li className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
								Nenhum resultado encontrado.
							</li>
						) : null}
					</ul>
				</section>
			) : null}
		</div>
	);
}
