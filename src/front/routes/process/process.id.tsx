import { Form, useLoaderData, useRevalidator, useSearchParams, useSubmit } from "react-router";
import { useState } from "react";
import { ConfirmModal } from "@/ConfirmModal";
import { AlertModal } from "@/AlertModal";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import type { Route } from "./+types/process.id";
import { LexicalEditor } from "@/LexicalEditor";
import type { StepRow, FileRow } from "./process.id.server";
import { systemNameFromMatches } from "../../lib/systemName";
import { formatDateTime } from "../../lib/formatDate";
import { cn } from "../../lib/utils";

export { loader, action } from "./process.id.server";

export function meta({ matches }: Route.MetaArgs) {
	return [{ title: `${systemNameFromMatches(matches)} — Processo` }];
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
	files: FileRow[];
};

export default function ProcessoEdit() {
	const data = useLoaderData() as Data;
	const revalidator = useRevalidator();
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
				<div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
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
							onUploaded={() => revalidator.revalidate()}
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
				<div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
					<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Todos os passos concluídos.
				</div>
			) : null}

			<AttachmentsList
				files={data.files}
				steps={data.steps}
				onChanged={() => revalidator.revalidate()}
			/>
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
	const submit = useSubmit();
	const [confirmDelete, setConfirmDelete] = useState(false);

	return (
		<div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50 truncate">
						{data.process.name}
					</h1>
					{data.process.description ? (
						<p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
							{data.process.description}
						</p>
					) : null}
					{data.process.id_fluxo ? (
						<p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
							Fluxo: <span className="font-medium text-slate-600 dark:text-slate-300">{fluxName(data)}</span>
						</p>
					) : null}
				</div>
				<div className="flex gap-2 shrink-0">
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => setShowMeta(!showMeta)}
					>
						{showMeta ? "Ocultar dados" : "Editar dados"}
					</Button>
					<Button
						type="button"
						size="sm"
						variant="destructive"
						onClick={() => setConfirmDelete(true)}
					>
						Excluir
					</Button>
				</div>
			</div>

			{confirmDelete && (
				<ConfirmModal
					message="Excluir este processo?"
					onConfirm={() => {
						submit({ intent: "delete" }, { method: "post" });
						setConfirmDelete(false);
					}}
					onCancel={() => setConfirmDelete(false)}
				/>
			)}

			{showMeta ? (
				<Form method="post" className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
					<input type="hidden" name="intent" value="updateMeta" />
					<Input name="name" defaultValue={data.process.name} placeholder="Nome" />
					<Input name="description" defaultValue={data.process.description} placeholder="Descrição" />
					<Button type="submit" size="sm" className="md:col-span-2 w-full">
						Salvar dados do processo
					</Button>
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
		<div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
						className={cn(
							"flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap border transition-colors font-medium",
							isViewing && "ring-2 ring-offset-1 ring-blue-500",
							done
								? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
								: isCurrent
									? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
									: isFuture
										? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-not-allowed"
										: ""
						)}
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
	onUploaded,
}: {
	step: StepRow;
	processId: string;
	positionLabel: string;
	onUploaded: () => void;
}) {
	return (
		<Form method="post" className="flex flex-col h-full min-h-0">
			<input type="hidden" name="step_id" value={step.id} />
			<div className="flex items-center justify-between mb-2">
				<div>
					<p className="text-xs uppercase text-slate-400 dark:text-slate-500 font-medium tracking-wide">
						{positionLabel}
					</p>
					<h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{step.name}</h2>
				</div>
				<div className="flex gap-2">
					<Button type="submit" name="intent" value="saveDraft" size="sm" variant="outline">
						Salvar rascunho
					</Button>
					<Button
						type="submit"
						name="intent"
						value="completeStep"
						size="sm"
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						Concluir passo →
					</Button>
				</div>
			</div>
			<LexicalEditor
				name="content"
				defaultHtml={step.content ?? ""}
				placeholder={`Conteúdo do passo "${step.name}"…`}
				tall
				uploadContext={{ processId, stepId: step.id }}
				onUploaded={onUploaded}
			/>
			<input type="hidden" name="process_id" value={processId} />
		</Form>
	);
}

function AttachmentsList({
	files,
	steps,
	onChanged,
}: {
	files: FileRow[];
	steps: StepRow[];
	onChanged: () => void;
}) {
	const [confirmFile, setConfirmFile] = useState<{ id: string; name: string } | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	if (files.length === 0) return null;

	const stepName = (id: string) => steps.find((s) => s.id === id)?.name ?? "—";

	function fmtSize(b: number) {
		if (b < 1024) return `${b} B`;
		if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
		return `${(b / (1024 * 1024)).toFixed(1)} MB`;
	}

	function openInPopup(id: string, name: string) {
		const url = `/api/files?id=${encodeURIComponent(id)}&download=1`;
		const w = window.open(url, `flower-file-${id}`, "width=520,height=320");
		if (!w) window.location.href = url;
	}

	async function deleteFileConfirmed(id: string) {
		const res = await fetch(`/api/files?id=${encodeURIComponent(id)}`, { method: "DELETE" });
		const json = (await res.json()) as { ok: boolean; error?: string };
		if (!json.ok) {
			setErrorMsg("Falha ao excluir: " + (json.error ?? "desconhecido"));
			return;
		}
		onChanged();
	}

	return (
		<>
			<section className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3">
				<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Anexos ({files.length})
				</h3>
				<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
					{files.map((f) => (
						<li
							key={f.id}
							className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900"
						>
							{f.is_image ? (
								<img
									src={`/api/files?id=${encodeURIComponent(f.id)}`}
									alt={f.name}
									className="w-12 h-12 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
								/>
							) : (
								<div className="w-12 h-12 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl shrink-0">
									📄
								</div>
							)}
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate" title={f.name}>
									{f.name}
								</p>
								<p className="text-xs text-slate-400 dark:text-slate-500 truncate">
									{f.mime_type || "binário"} · {fmtSize(f.size_bytes)} · {stepName(f.id_step)}
								</p>
							</div>
							<div className="flex gap-1 shrink-0">
								{f.is_image ? (
									<a
										href={`/api/files?id=${encodeURIComponent(f.id)}`}
										target="_blank"
										rel="noreferrer"
										title="Abrir imagem"
									>
										<Button size="sm" variant="outline">Abrir</Button>
									</a>
								) : (
									<Button
										size="sm"
										variant="outline"
										type="button"
										onClick={() => openInPopup(f.id, f.name)}
										title="Baixar arquivo"
									>
										Baixar
									</Button>
								)}
								<Button
									size="sm"
									variant="ghost"
									type="button"
									onClick={() => setConfirmFile({ id: f.id, name: f.name })}
									className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
									title="Excluir"
								>
									✕
								</Button>
							</div>
						</li>
					))}
				</ul>
			</section>

			{confirmFile && (
				<ConfirmModal
					message={`Excluir o arquivo "${confirmFile.name}"?`}
					onConfirm={() => {
						const f = confirmFile;
						setConfirmFile(null);
						deleteFileConfirmed(f.id);
					}}
					onCancel={() => setConfirmFile(null)}
				/>
			)}
			{errorMsg && <AlertModal message={errorMsg} onClose={() => setErrorMsg(null)} />}
		</>
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
	const submit = useSubmit();
	const [confirmReopen, setConfirmReopen] = useState(false);

	return (
		<div className="flex flex-col h-full min-h-0">
			<div className="flex items-center justify-between mb-2">
				<div>
					<p className="text-xs uppercase text-slate-400 dark:text-slate-500 font-medium tracking-wide">
						{positionLabel} — somente leitura
					</p>
					<h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{step.name}</h2>
					{step.completed_at ? (
						<p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
							✓ Concluído em {formatDateTime(step.completed_at)}
						</p>
					) : null}
				</div>
				<div className="flex gap-2">
					{step.completed_at ? (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() => setConfirmReopen(true)}
						>
							Reabrir
						</Button>
					) : null}
					{!isCurrent ? (
						<Button type="button" size="sm" onClick={onJumpToCurrent}>
							Ir para passo atual
						</Button>
					) : null}
				</div>
			</div>
			<div
				className="flex-1 min-h-0 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900"
				dangerouslySetInnerHTML={{
					__html:
						step.content ||
						'<p class="text-slate-400 italic">(vazio)</p>',
				}}
			/>
			{confirmReopen && (
				<ConfirmModal
					message="Reabrir este passo? Você terá que concluí-lo novamente."
					onConfirm={() => {
						submit({ intent: "reopenStep", step_id: step.id }, { method: "post" });
						setConfirmReopen(false);
					}}
					onCancel={() => setConfirmReopen(false)}
				/>
			)}
		</div>
	);
}
