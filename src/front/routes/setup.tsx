import { Form, useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/setup";
import type { Setting, VersionInfo } from "../.server/setup/setup";
import { systemNameFromMatches } from "../lib/systemName";
import { formatDateTime } from "../lib/formatDate";

export { loader, action } from "../.server/setup/setup";

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
	if (!version?.timestamp && !version?.id) return null;
	return (
		<footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center uppercase tracking-wide">
			{version?.timestamp && (
				<span className="text-gray-400 normal-case" title={version.id}>
					Version: {version?.tag && "v" + version.tag + " "}
					{formatDateTime(version.timestamp)}
					{" :: "}
				</span>
			)}
			{!version?.timestamp && version?.id ? (
				<span className="text-gray-400 normal-case" title={version.id}>
					Version: {version.id.slice(0, 8)}
				</span>
			) : null}
		</footer>
	);
}

function SettingRow({ item }: { item: Setting }) {
	const [editing, setEditing] = useState(false);
	const secret = isSecret(item.name);

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
					<Form method="post">
						<input type="hidden" name="intent" value="delete" />
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							onClick={(e) => {
								if (!confirm(`Excluir "${item.name}"?`)) e.preventDefault();
							}}
							className="w-full text-xs px-2 py-1 rounded bg-red-600 text-white"
						>
							Excluir
						</button>
					</Form>
				</div>
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
