import { Form, useLoaderData } from "react-router";
import { useState } from "react";

import type { Route } from "./+types/flow.id";
import { systemNameFromMatches } from "../lib/systemName";

export { loader, action } from "../.server/flow/flow.id";

export function meta({ matches }: Route.MetaArgs) {
	return [{ title: `${systemNameFromMatches(matches)} — Fluxo` }];
}

type Step = { id: string; id_order: number; name: string };
type Data = {
	flux: { id: string; name: string; description: string; created_at: string; updated_at: string };
	steps: Step[];
};

export default function FluxoEdit() {
	const data = useLoaderData() as Data;

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Editar fluxo</h1>
				<Form method="post" action="/process">
					<input type="hidden" name="intent" value="startFromFlow" />
					<input type="hidden" name="id_fluxo" value={data.flux.id} />
					<button className="text-sm px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">
						▶ Iniciar processo a partir deste fluxo
					</button>
				</Form>
			</div>

			<section className="border border-gray-200 dark:border-gray-700 rounded p-4">
				<h2 className="text-sm font-semibold mb-3">Dados do fluxo</h2>
				<Form method="post" className="space-y-3">
					<input type="hidden" name="intent" value="updateFlux" />
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
			</section>

			<section className="border border-gray-200 dark:border-gray-700 rounded p-4">
				<h2 className="text-sm font-semibold mb-3">Passos</h2>
				{data.steps.length === 0 ? (
					<p className="text-sm text-gray-500 mb-3">Nenhum passo ainda. Adicione o primeiro abaixo.</p>
				) : (
					<ul className="space-y-2 mb-4">
						{data.steps.map((s, i) => (
							<StepRow key={s.id} step={s} index={i} />
						))}
					</ul>
				)}

				<AddStepForm />
			</section>
		</div>
	);
}

function StepRow({ step, index }: { step: Step; index: number }) {
	const [name, setName] = useState(step.name);
	const dirty = name !== step.name;
	return (
		<li className="flex items-center gap-2">
			<span className="w-8 text-xs text-gray-500 text-right">{index + 1}.</span>
			<Form method="post" className="flex-1 flex gap-2">
				<input type="hidden" name="intent" value="renameStep" />
				<input type="hidden" name="stepId" value={step.id} />
				<input
					name="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
				/>
				<button
					type="submit"
					disabled={!dirty || !name.trim()}
					className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-40"
				>
					Salvar
				</button>
			</Form>
			<Form method="post">
				<input type="hidden" name="intent" value="removeStep" />
				<input type="hidden" name="stepId" value={step.id} />
				<button
					type="submit"
					onClick={(e) => {
						if (!confirm("Remover este passo?")) e.preventDefault();
					}}
					className="px-2 py-2 rounded bg-red-100 text-red-700"
					aria-label="Remover passo"
					title="Remover passo"
				>
					×
				</button>
			</Form>
		</li>
	);
}

function AddStepForm() {
	const [name, setName] = useState("");
	return (
		<Form
			method="post"
			className="flex gap-2"
			onSubmit={() => setTimeout(() => setName(""), 0)}
		>
			<input type="hidden" name="intent" value="addStep" />
			<input
				name="name"
				required
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Novo passo"
				className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
			/>
			<button
				type="submit"
				disabled={!name.trim()}
				className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-40"
			>
				+ Adicionar passo
			</button>
		</Form>
	);
}
