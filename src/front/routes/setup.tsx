import { Form, useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/setup";
import type { Setting } from "../.server/setup/setup";

export { loader, action } from "../.server/setup/setup";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Flower — Configuração" }];
}

type Data = { items: Setting[] };

export default function Configuracao() {
	const data = useLoaderData() as Data;
	const [adding, setAdding] = useState(false);

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Configuração</h1>
				<button
					type="button"
					onClick={() => setAdding((v) => !v)}
					className="px-3 py-2 rounded bg-green-600 text-white text-sm"
				>
					{adding ? "Cancelar" : "+ Nova configuração"}
				</button>
			</div>

			{adding ? (
				<Form method="post" className="border border-gray-200 dark:border-gray-700 rounded p-4 space-y-3 mb-4">
					<input type="hidden" name="intent" value="upsert" />
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm mb-1">Nome (chave)</label>
							<input name="name" required className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
						</div>
						<div>
							<label className="block text-sm mb-1">Valor</label>
							<input name="value" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
						</div>
					</div>
					<div>
						<label className="block text-sm mb-1">Descrição</label>
						<input name="description" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
					</div>
					<button className="px-3 py-2 rounded bg-blue-600 text-white">Salvar</button>
				</Form>
			) : null}

			<div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 dark:bg-gray-900">
						<tr>
							<th className="text-left px-3 py-2">Nome</th>
							<th className="text-left px-3 py-2">Valor</th>
							<th className="text-left px-3 py-2">Descrição</th>
							<th className="px-3 py-2"></th>
						</tr>
					</thead>
					<tbody>
						{data.items.length === 0 ? (
							<tr>
								<td colSpan={4} className="px-3 py-4 text-center text-gray-500">
									Sem configurações cadastradas.
								</td>
							</tr>
						) : (
							data.items.map((s) => (
								<tr key={s.id} className="border-t border-gray-200 dark:border-gray-800">
									<td className="px-3 py-2">
										<Form method="post" className="contents">
											<input type="hidden" name="intent" value="upsert" />
											<input type="hidden" name="id" value={s.id} />
											<input name="name" defaultValue={s.name} className="w-full bg-transparent outline-none" />
									</Form>
									</td>
									<td className="px-3 py-2">
										<Form method="post" className="contents">
											<input type="hidden" name="intent" value="upsert" />
											<input type="hidden" name="id" value={s.id} />
											<input type="hidden" name="name" value={s.name} />
											<input
												name="value"
												defaultValue={s.value}
												className="w-full bg-transparent outline-none"
											/>
										</Form>
									</td>
									<td className="px-3 py-2 text-gray-500">{s.description}</td>
									<td className="px-3 py-2 text-right">
										<Form method="post">
											<input type="hidden" name="intent" value="delete" />
											<input type="hidden" name="id" value={s.id} />
											<button
												type="submit"
												onClick={(e) => {
													if (!confirm("Excluir esta configuração?")) e.preventDefault();
												}}
												className="text-xs text-red-600 hover:underline"
											>
												excluir
											</button>
										</Form>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
