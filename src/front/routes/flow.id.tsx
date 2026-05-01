import { Form, useLoaderData } from "react-router";
import { useState } from "react";

import type { Route } from "./+types/flow.id";

export { loader, action } from "../.server/flow/flow.id";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Flower — Fluxo" }];
}

type Step = { id: string; id_order: number; name: string };
type Data = {
	flux: { id: string; name: string; description: string; created_at: string; updated_at: string };
	steps: Step[];
};

export default function FluxoEdit() {
	const data = useLoaderData() as Data;
	const [steps, setSteps] = useState<string[]>(
		data.steps.length > 0 ? data.steps.map((s) => s.name) : [""]
	);

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Editar fluxo</h1>
				<Form method="post" action="/process">
					<input type="hidden" name="intent" value="startFromFlow" />
					<input type="hidden" name="id_fluxo" value={data.flux.id} />
					<button className="text-sm px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">
						▶ Iniciar processo a partir deste fluxo
					</button>
				</Form>
			</div>
			<Form method="post" className="space-y-3">
				<div>
					<label className="block text-sm mb-1">Nome do Fluxo</label>
					<input
						name="name"
						required
						defaultValue={data.flux.name}
						className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
					/>
				</div>
				<div>
					<label className="block text-sm mb-1">Descrição</label>
					<textarea
						name="description"
						defaultValue={data.flux.description}
						className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
					/>
				</div>
				<div>
					<label className="block text-sm mb-1">Passos</label>
					<div className="space-y-2">
						{steps.map((s, i) => (
							<div key={i} className="flex gap-2">
								<input
									name="step"
									value={s}
									onChange={(e) => setSteps(steps.map((x, j) => (i === j ? e.target.value : x)))}
									placeholder={`Passo ${i + 1}`}
									className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
								/>
								<button
									type="button"
									onClick={() => setSteps(steps.filter((_, j) => j !== i))}
									className="px-2 rounded bg-red-100 text-red-700"
								>
									×
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={() => setSteps([...steps, ""])}
							className="text-sm text-blue-600 hover:underline"
						>
							+ Adicionar passo
						</button>
					</div>
				</div>
				<div className="flex justify-between">
					<button className="px-3 py-2 rounded bg-blue-600 text-white">Salvar</button>
					<button
						type="submit"
						name="intent"
						value="delete"
						formNoValidate
						onClick={(e) => {
							if (!confirm("Excluir este fluxo?")) e.preventDefault();
						}}
						className="px-3 py-2 rounded bg-red-600 text-white"
					>
						Excluir
					</button>
				</div>
			</Form>
		</div>
	);
}
