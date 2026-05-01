import { Form, useLoaderData, useSearchParams } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/process.id";
import { LexicalEditor } from "../components/LexicalEditor";
import type { StepRow } from "../.server/process/process.id";

export { loader, action } from "../.server/process/process.id";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Flower — Processo" }];
}

type Data = {
	process: {
		id: string;
		id_fluxo: string | null;
		name: string;
		description: string;
		created_at: string;
		updated_at: string;
	};
	steps: StepRow[];
	fluxes: { id: string; name: string }[];
};

export default function ProcessoEdit() {
	const data = useLoaderData() as Data;
	const [searchParams, setSearchParams] = useSearchParams();
	const [showMeta, setShowMeta] = useState(false);

	const steps = data.steps;
	const total = steps.length;
	const firstPending = steps.findIndex((s) => !s.completed_at);
	const allDone = total > 0 && firstPending === -1;
	const currentIdx = allDone ? total - 1 : firstPending === -1 ? 0 : firstPending;

	const viewRaw = searchParams.get("view");
	const viewParam = viewRaw === null ? NaN : Number(viewRaw);
	const viewIdx =
		Number.isFinite(viewParam) && viewParam >= 0 && viewParam < total ? viewParam : currentIdx;

	const viewing = steps[viewIdx];
	const isCurrent = viewing && !viewing.completed_at && viewIdx === currentIdx;

	function goTo(idx: number) {
		const next = new URLSearchParams(searchParams);
		if (idx === currentIdx) next.delete("view");
		else next.set("view", String(idx));
		setSearchParams(next);
	}

	if (total === 0) {
		return (
			<div className="max-w-3xl mx-auto">
				<ProcessHeader data={data} showMeta={showMeta} setShowMeta={setShowMeta} />
				<div className="border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded p-4 text-sm">
					Este processo ainda não tem passos. Use{" "}
					<span className="font-mono">▶ Iniciar processo a partir deste fluxo</span> em um fluxo para gerar os passos.
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)] min-h-0">
			<ProcessHeader data={data} showMeta={showMeta} setShowMeta={setShowMeta} />
			<Stepper steps={steps} viewIdx={viewIdx} currentIdx={currentIdx} onGo={goTo} />

			<div className="flex-1 min-h-0 mt-3">
				{viewing ? (
					isCurrent ? (
						<CurrentStepForm
							key={viewing.id}
							step={viewing}
							processId={data.process.id}
							positionLabel={`Passo ${viewIdx + 1} de ${total}`}
						/>
					) : (
						<ReadOnlyStep
							step={viewing}
							positionLabel={`Passo ${viewIdx + 1} de ${total}`}
							isCurrent={viewIdx === currentIdx}
							onJumpToCurrent={() => goTo(currentIdx)}
						/>
					)
				) : null}
			</div>

			{allDone ? (
				<div className="mt-3 text-sm text-green-700 dark:text-green-400">
					✓ Todos os passos concluídos.
				</div>
			) : null}
		</div>
	);
}

function fluxName(data: Data) {
	if (!data.process.id_fluxo) return "";
	return data.fluxes.find((f) => f.id === data.process.id_fluxo)?.name ?? "(removido)";
}

function ProcessHeader({
	data,
	showMeta,
	setShowMeta,
}: {
	data: Data;
	showMeta: boolean;
	setShowMeta: (v: boolean) => void;
}) {
	return (
		<div className="border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
			<div className="flex items-center justify-between gap-2">
				<h1 className="text-lg font-semibold truncate">{data.process.name}</h1>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setShowMeta(!showMeta)}
						className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						{showMeta ? "Ocultar dados" : "Editar dados"}
					</button>
					<Form method="post">
						<input type="hidden" name="intent" value="delete" />
						<button
							type="submit"
							onClick={(e) => {
								if (!confirm("Excluir este processo?")) e.preventDefault();
							}}
							className="text-xs px-2 py-1 rounded bg-red-600 text-white"
						>
							Excluir
						</button>
					</Form>
				</div>
			</div>
			{data.process.description ? (
				<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.process.description}</div>
			) : null}
			{data.process.id_fluxo ? (
				<div className="text-xs text-gray-500 mt-1">
					Fluxo: <span className="font-medium">{fluxName(data)}</span>
				</div>
			) : null}
			{showMeta ? (
				<Form method="post" className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
					<input type="hidden" name="intent" value="updateMeta" />
					<input
						name="name"
						defaultValue={data.process.name}
						className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
					/>
					<input
						name="description"
						defaultValue={data.process.description}
						placeholder="Descrição"
						className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
					/>
					<button className="md:col-span-2 text-sm px-3 py-1 rounded bg-blue-600 text-white">
						Salvar dados do processo
					</button>
				</Form>
			) : null}
		</div>
	);
}

function Stepper({
	steps,
	viewIdx,
	currentIdx,
	onGo,
}: {
	steps: StepRow[];
	viewIdx: number;
	currentIdx: number;
	onGo: (idx: number) => void;
}) {
	return (
		<div className="flex items-center gap-1 overflow-x-auto">
			{steps.map((s, i) => {
				const done = !!s.completed_at;
				const isCurrent = i === currentIdx;
				const isFuture = i > currentIdx && !done;
				const isViewing = i === viewIdx;
				const canClick = done || isCurrent;
				return (
					<button
						key={s.id}
						type="button"
						disabled={!canClick}
						onClick={() => canClick && onGo(i)}
						title={s.name}
						className={
							"flex items-center gap-1 text-xs px-2 py-1 rounded whitespace-nowrap border transition " +
							(isViewing ? "ring-2 ring-blue-400 " : "") +
							(done
								? "bg-green-100 text-green-900 border-green-200 dark:bg-green-900/40 dark:text-green-100 dark:border-green-800"
								: isCurrent
									? "bg-blue-600 text-white border-blue-700"
									: isFuture
										? "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 cursor-not-allowed"
										: "")
						}
					>
						<span className="font-mono">{done ? "✓" : i + 1}</span>
						<span className="truncate max-w-32">{s.name}</span>
					</button>
				);
			})}
		</div>
	);
}

function CurrentStepForm({
	step,
	processId,
	positionLabel,
}: {
	step: StepRow;
	processId: string;
	positionLabel: string;
}) {
	return (
		<Form method="post" className="flex flex-col h-full min-h-0">
			<input type="hidden" name="step_id" value={step.id} />
			<div className="flex items-center justify-between mb-2">
				<div>
					<div className="text-xs uppercase text-gray-500">{positionLabel}</div>
					<h2 className="text-base font-medium">{step.name}</h2>
				</div>
				<div className="flex gap-2">
					<button
						type="submit"
						name="intent"
						value="saveDraft"
						className="text-sm px-3 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						Salvar rascunho
					</button>
					<button
						type="submit"
						name="intent"
						value="completeStep"
						className="text-sm px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
					>
						Concluir passo →
					</button>
				</div>
			</div>
			<LexicalEditor
				name="content"
				defaultHtml={step.content ?? ""}
				placeholder={`Conteúdo do passo "${step.name}"…`}
				tall
			/>
			<input type="hidden" name="process_id" value={processId} />
		</Form>
	);
}

function ReadOnlyStep({
	step,
	positionLabel,
	isCurrent,
	onJumpToCurrent,
}: {
	step: StepRow;
	positionLabel: string;
	isCurrent: boolean;
	onJumpToCurrent: () => void;
}) {
	return (
		<div className="flex flex-col h-full min-h-0">
			<div className="flex items-center justify-between mb-2">
				<div>
					<div className="text-xs uppercase text-gray-500">{positionLabel} (somente leitura)</div>
					<h2 className="text-base font-medium">{step.name}</h2>
					{step.completed_at ? (
						<div className="text-xs text-green-700 dark:text-green-400">
							✓ concluído em {step.completed_at}
						</div>
					) : null}
				</div>
				<div className="flex gap-2">
					{step.completed_at ? (
						<Form method="post">
							<input type="hidden" name="intent" value="reopenStep" />
							<input type="hidden" name="step_id" value={step.id} />
							<button
								type="submit"
								onClick={(e) => {
									if (!confirm("Reabrir este passo? Você terá que concluí-lo novamente."))
										e.preventDefault();
								}}
								className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
							>
								Reabrir
							</button>
						</Form>
					) : null}
					{!isCurrent ? (
						<button
							type="button"
							onClick={onJumpToCurrent}
							className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
						>
							Ir para passo atual
						</button>
					) : null}
				</div>
			</div>
			<div
				className="flex-1 min-h-0 overflow-auto border border-gray-200 dark:border-gray-700 rounded px-3 py-2 prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900"
				dangerouslySetInnerHTML={{ __html: step.content || "<p class='text-gray-400'>(vazio)</p>" }}
			/>
		</div>
	);
}
