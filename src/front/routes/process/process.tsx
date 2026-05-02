import { Form, Link, useLoaderData, useSearchParams } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/process";
import type { ProcessRow } from "./process.server";
import { systemNameFromMatches } from "../../lib/systemName";
import { formatDateTime } from "../../lib/formatDate";

export { loader, action } from "./process.server";

export function meta({ matches }: Route.MetaArgs) {
	return [{ title: `${systemNameFromMatches(matches)} — Processos` }];
}

type Data = {
	q: string;
	page: number;
	pageSize: number;
	total: number;
	items: ProcessRow[];
	fluxes: { id: string; name: string }[];
};

export default function Processos() {
	const data = useLoaderData() as Data;
	const [params, setParams] = useSearchParams();
	const [creating, setCreating] = useState(false);
	const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex items-center gap-2 mb-4">
				<Form method="get" className="flex-1 flex gap-2">
					<input
						name="q"
						defaultValue={data.q}
						placeholder="Pesquisar processos…"
						className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
					/>
					<button className="px-3 py-2 rounded bg-blue-600 text-white">Buscar</button>
				</Form>
				<button
					type="button"
					onClick={() => setCreating((v) => !v)}
					className="px-3 py-2 rounded bg-green-600 text-white"
				>
					{creating ? "Cancelar" : "+ Novo processo"}
				</button>
			</div>

			{creating ? (
				<Form method="post" className="border border-gray-200 dark:border-gray-700 rounded p-4 space-y-3 mb-4">
					<input type="hidden" name="intent" value="create" />
					<div>
						<label className="block text-sm mb-1">Nome do processo</label>
						<input
							name="name"
							required
							className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
						/>
					</div>
					<div>
						<label className="block text-sm mb-1">Descrição</label>
						<textarea name="description" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
					</div>
					<div>
						<label className="block text-sm mb-1">Fluxo (opcional)</label>
						<select name="id_fluxo" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
							<option value="">— sem fluxo —</option>
							{data.fluxes.map((f) => (
								<option key={f.id} value={f.id}>
									{f.name}
								</option>
							))}
						</select>
					</div>
					<button className="px-3 py-2 rounded bg-blue-600 text-white">Criar</button>
				</Form>
			) : null}

			<ul className="space-y-2">
				{data.items.map((p) => (
					<li key={p.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 flex justify-between items-start">
						<div className="min-w-0">
							<Link to={`/process/${p.id}`} className="text-blue-600 hover:underline font-medium">
								{p.name}
							</Link>
							{p.description ? (
								<div className="text-sm text-gray-600 dark:text-gray-400 truncate">{p.description}</div>
							) : null}
							<div className="text-xs text-gray-500">Atualizado: {formatDateTime(p.updated_at)}</div>
						</div>
						<Form method="post">
							<input type="hidden" name="intent" value="delete" />
							<input type="hidden" name="id" value={p.id} />
							<button
								type="submit"
								onClick={(e) => {
									if (!confirm("Excluir este processo?")) e.preventDefault();
								}}
								className="text-xs text-red-600 hover:underline"
							>
								excluir
							</button>
						</Form>
					</li>
				))}
				{data.items.length === 0 ? <li className="text-sm text-gray-500">Nenhum processo encontrado.</li> : null}
			</ul>

			{totalPages > 1 ? (
				<div className="mt-4 flex justify-center gap-2 text-sm">
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button
							key={p}
							onClick={() => {
								const next = new URLSearchParams(params);
								next.set("page", String(p));
								setParams(next);
							}}
							className={
								"px-2 py-1 rounded " +
								(p === data.page ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800")
							}
						>
							{p}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
