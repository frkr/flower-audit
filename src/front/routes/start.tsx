// Facade para a rota "Começar".
import { useEffect, useState } from "react";
import { Form, Link } from "react-router";
import type { Route } from "./+types/start";
import { useSearch } from "@/SearchContext";
import { systemNameFromMatches } from "../lib/systemName";

export { loader } from "../.server/start/start";

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
				className={
					"transition-all duration-500 ease-out " +
					(collapsed
						? "w-72"
						: "max-w-2xl mx-auto mt-32 w-full")
				}
			>
				<div className="flex gap-2">
					<input
						autoFocus
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Pesquisar fluxos e processos…"
						className={
							"flex-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400 " +
							(collapsed ? "text-xs px-3 py-1" : "text-lg px-5 py-3 shadow-sm")
						}
					/>
					<button
						type="submit"
						className={
							"rounded-full bg-blue-600 text-white " +
							(collapsed ? "text-xs px-3 py-1" : "px-5 py-3")
						}
					>
						{collapsed ? "↑" : "Pesquisar"}
					</button>
				</div>
			</form>

			{collapsed ? (
				<section className="mt-6 max-w-3xl">
					<div className="text-xs uppercase text-gray-500 mb-2">
						{phase === "flux"
							? "Buscando em fluxos…"
							: phase === "process"
								? "Buscando em processos…"
								: phase === "done"
									? `${hits.length} resultado(s)`
									: ""}
					</div>
					<ul className="space-y-2">
						{hits.map((h) => (
							<li
								key={`${h.kind}:${h.id}`}
								className="border border-gray-200 dark:border-gray-700 rounded p-3 flex justify-between items-start gap-3"
							>
								<div className="min-w-0">
									<div className="text-xs uppercase text-gray-500">{h.kind === "flux" ? "Fluxo" : "Processo"}</div>
									<Link
										to={h.kind === "flux" ? `/flow/${h.id}` : `/process/${h.id}`}
										className="text-blue-600 hover:underline font-medium"
									>
										{h.name}
									</Link>
									{h.description ? (
										<div className="text-sm text-gray-600 dark:text-gray-400">{h.description}</div>
									) : null}
								</div>
								{h.kind === "flux" ? (
									<Form method="post" action="/process">
										<input type="hidden" name="intent" value="startFromFlow" />
										<input type="hidden" name="id_fluxo" value={h.id} />
										<button className="whitespace-nowrap text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">
											▶ Iniciar processo
										</button>
									</Form>
								) : null}
							</li>
						))}
						{phase === "done" && hits.length === 0 ? (
							<li className="text-sm text-gray-500">Sem resultados.</li>
						) : null}
					</ul>
				</section>
			) : null}
		</div>
	);
}
