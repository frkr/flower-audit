import { Form, useLoaderData, useSubmit } from "react-router";
import { useState } from "react";
import { ConfirmModal } from "@/ConfirmModal";
import type { Route } from "./+types/setup";
import type { Setting, VersionInfo } from "./setup.server";
import { systemNameFromMatches } from "../../lib/systemName";
import { formatDateTime } from "../../lib/formatDate";

export { loader, action } from "./setup.server";

export function meta({ matches }: Route.MetaArgs) {
	return [{ title: `${systemNameFromMatches(matches)} — Configuração` }];
}

type Data = { items: Setting[]; version: VersionInfo };

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
				<Form
					method="post"
					className="border border-gray-200 dark:border-gray-700 rounded p-4 space-y-3 mb-4"
				>
					<input type="hidden" name="intent" value="upsert" />
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm mb-1">Nome (chave)</label>
							<input
								name="name"
								required
								className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
							/>
						</div>
						<div>
							<label className="block text-sm mb-1">Valor</label>
							<input
								name="value"
								className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm mb-1">Descrição</label>
						<input
							name="description"
							className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
						/>
					</div>
					<button className="px-3 py-2 rounded bg-blue-600 text-white">Salvar</button>
				</Form>
			) : null}

			<ul className="space-y-2">
				{data.items.length === 0 ? (
					<li className="text-sm text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded p-4 text-center">
						Sem configurações cadastradas.
					</li>
				) : (
					data.items.map((s) => <SettingRow key={s.id} item={s} />)
				)}
			</ul>

			<VersionFooter version={data.version} />
		</div>
	);
}

function VersionFooter({ version }: { version: VersionInfo }) {
	const hasVersion = Boolean(version?.timestamp || version?.id);
	return (
		<footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 uppercase tracking-wide">
			{version?.timestamp ? (
				<span className="text-gray-400 normal-case" title={version.id}>
					Version: {version?.tag && "v" + version.tag + " "}
					{formatDateTime(version.timestamp)}
				</span>
			) : null}
			{!version?.timestamp && version?.id ? (
				<span className="text-gray-400 normal-case" title={version.id}>
					Version: {version.id.slice(0, 8)}
				</span>
			) : null}
			{hasVersion ? <span aria-hidden="true">::</span> : null}
			<a
				href="https://github.com/frkr/flower-audit"
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
				aria-label="Repositório no GitHub"
				title="Repositório no GitHub"
			>
				<GitHubIcon />
			</a>
		</footer>
	);
}

function GitHubIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.68.8.56C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5Z"
			/>
		</svg>
	);
}

function SettingRow({ item }: { item: Setting }) {
	const [editing, setEditing] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const secret = isSecret(item.name);
	const submit = useSubmit();

	if (!editing) {
		return (
			<li className="border border-gray-200 dark:border-gray-700 rounded p-3 flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="text-xs uppercase text-gray-500">{item.name}</div>
					<div
						className="text-sm font-mono break-all"
						title={secret ? undefined : item.value}
					>
						{maskValue(item.name, item.value)}
					</div>
					{item.description ? (
						<div className="text-xs text-gray-500 mt-1">{item.description}</div>
					) : null}
				</div>
				<div className="flex flex-col gap-1">
					<button
						type="button"
						onClick={() => setEditing(true)}
						className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						Editar
					</button>
					<button
						type="button"
						onClick={() => setConfirmDelete(true)}
						className="w-full text-xs px-2 py-1 rounded bg-red-600 text-white"
					>
						Excluir
					</button>
				</div>
				{confirmDelete && (
					<ConfirmModal
						message={`Excluir "${item.name}"?`}
						onConfirm={() => {
							submit({ intent: "delete", id: item.id }, { method: "post" });
							setConfirmDelete(false);
						}}
						onCancel={() => setConfirmDelete(false)}
					/>
				)}
			</li>
		);
	}

	return (
		<li className="border border-blue-300 dark:border-blue-700 rounded p-3">
			<Form method="post" className="space-y-2" onSubmit={() => setEditing(false)}>
				<input type="hidden" name="intent" value="upsert" />
				<input type="hidden" name="id" value={item.id} />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					<label className="text-sm">
						<span className="block text-xs uppercase text-gray-500 mb-1">Nome</span>
						<input
							name="name"
							defaultValue={item.name}
							required
							className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
						/>
					</label>
					<label className="text-sm">
						<span className="block text-xs uppercase text-gray-500 mb-1">Valor</span>
						<input
							name="value"
							type={secret ? "password" : "text"}
							defaultValue={secret ? "" : item.value}
							placeholder={secret ? "(novo valor — atual oculto)" : undefined}
							autoComplete={secret ? "new-password" : undefined}
							className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono"
						/>
					</label>
				</div>
				<label className="text-sm block">
					<span className="block text-xs uppercase text-gray-500 mb-1">Descrição</span>
					<input
						name="description"
						defaultValue={item.description}
						className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
					/>
				</label>
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={() => setEditing(false)}
						className="text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
					>
						Cancelar
					</button>
					<button
						type="submit"
						className="text-xs px-3 py-1 rounded bg-blue-600 text-white"
					>
						Salvar
					</button>
				</div>
			</Form>
		</li>
	);
}

function isSecret(name: string): boolean {
	return /secret/i.test(name);
}

function maskValue(name: string, value: string): string {
	if (!value) return "(vazio)";
	if (!isSecret(name)) return value;
	return "*".repeat(Math.max(value.length, 8));
}
