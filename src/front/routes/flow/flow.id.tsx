import { Form, useLoaderData, useSubmit } from "react-router";
import { useState } from "react";
import { ConfirmModal } from "@/ConfirmModal";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

import type { Route } from "./+types/flow.id";
import { systemNameFromMatches } from "../../lib/systemName";

export { loader, action } from "./flow.id.server";

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
	const submit = useSubmit();
	const [confirmDelete, setConfirmDelete] = useState(false);

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
						{data.flux.name}
					</h1>
					{data.flux.description && (
						<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
							{data.flux.description}
						</p>
					)}
				</div>
				<Form method="post" action="/process">
					<input type="hidden" name="intent" value="startFromFlow" />
					<input type="hidden" name="id_fluxo" value={data.flux.id} />
					<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
						▶ Iniciar processo
					</Button>
				</Form>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Dados do fluxo</CardTitle>
				</CardHeader>
				<CardContent>
					<Form method="post" className="space-y-4">
						<input type="hidden" name="intent" value="updateFlux" />
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
								Nome do Fluxo
							</label>
							<Input name="name" required defaultValue={data.flux.name} />
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
								Descrição
							</label>
							<textarea
								name="description"
								defaultValue={data.flux.description}
								className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-300"
							/>
						</div>
						<div className="flex justify-between pt-1">
							<Button type="submit">Salvar alterações</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={() => setConfirmDelete(true)}
							>
								Excluir fluxo
							</Button>
						</div>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Passos
						<span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
							({data.steps.length})
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{data.steps.length === 0 ? (
						<p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
							Nenhum passo ainda. Adicione o primeiro abaixo.
						</p>
					) : (
						<ul className="space-y-2 mb-4">
							{data.steps.map((s, i) => (
								<StepRow key={s.id} step={s} index={i} />
							))}
						</ul>
					)}
					<AddStepForm />
				</CardContent>
			</Card>

			{confirmDelete && (
				<ConfirmModal
					message="Excluir este fluxo?"
					onConfirm={() => {
						submit({ intent: "delete" }, { method: "post" });
						setConfirmDelete(false);
					}}
					onCancel={() => setConfirmDelete(false)}
				/>
			)}
		</div>
	);
}

function StepRow({ step, index }: { step: Step; index: number }) {
	const [name, setName] = useState(step.name);
	const dirty = name !== step.name;
	const submit = useSubmit();
	const [confirmRemove, setConfirmRemove] = useState(false);

	return (
		<li className="flex items-center gap-2">
			<span className="w-7 text-xs text-slate-400 dark:text-slate-500 text-right shrink-0 font-mono">
				{index + 1}.
			</span>
			<Form method="post" className="flex-1 flex gap-2">
				<input type="hidden" name="intent" value="renameStep" />
				<input type="hidden" name="stepId" value={step.id} />
				<Input
					name="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="flex-1"
				/>
				<Button
					type="submit"
					size="sm"
					variant="secondary"
					disabled={!dirty || !name.trim()}
				>
					Salvar
				</Button>
			</Form>
			<Button
				type="button"
				size="sm"
				variant="ghost"
				onClick={() => setConfirmRemove(true)}
				className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
				aria-label="Remover passo"
			>
				×
			</Button>
			{confirmRemove && (
				<ConfirmModal
					message="Remover este passo?"
					onConfirm={() => {
						submit({ intent: "removeStep", stepId: step.id }, { method: "post" });
						setConfirmRemove(false);
					}}
					onCancel={() => setConfirmRemove(false)}
				/>
			)}
		</li>
	);
}

function AddStepForm() {
	const [name, setName] = useState("");
	return (
		<Form
			method="post"
			className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2"
			onSubmit={() => setTimeout(() => setName(""), 0)}
		>
			<input type="hidden" name="intent" value="addStep" />
			<Input
				name="name"
				required
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Nome do novo passo…"
				className="flex-1"
			/>
			<Button type="submit" disabled={!name.trim()}>
				+ Adicionar
			</Button>
		</Form>
	);
}
