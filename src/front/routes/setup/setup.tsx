import { Form, useLoaderData, useSubmit } from "react-router";
import { useState } from "react";
import { ConfirmModal } from "@/ConfirmModal";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
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
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Configuração</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
						Gerencie os parâmetros do sistema
					</p>
				</div>
				<Button
					type="button"
					onClick={() => setAdding((v) => !v)}
					variant={adding ? "outline" : "default"}
				>
					{adding ? "Cancelar" : "+ Nova configuração"}
				</Button>
			</div>

			{adding ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Nova configuração</CardTitle>
					</CardHeader>
					<CardContent>
						<Form method="post" className="space-y-4">
							<input type="hidden" name="intent" value="upsert" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
										Chave
									</label>
									<Input name="name" required placeholder="ex: system_name" />
								</div>
								<div className="space-y-1.5">
									<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
										Valor
									</label>
									<Input name="value" placeholder="Valor da configuração" />
								</div>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									Descrição
								</label>
								<Input name="description" placeholder="Descreva esta configuração…" />
							</div>
							<div className="flex gap-2">
								<Button type="submit">Salvar</Button>
								<Button type="button" variant="outline" onClick={() => setAdding(false)}>
									Cancelar
								</Button>
							</div>
						</Form>
					</CardContent>
				</Card>
			) : null}

			{data.items.length === 0 ? (
				<div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center text-slate-500 dark:text-slate-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
						/>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<p className="text-sm font-medium">Sem configurações</p>
					<p className="text-xs mt-1">Adicione sua primeira configuração.</p>
				</div>
			) : (
				<ul className="space-y-2">
					{data.items.map((s) => (
						<SettingRow key={s.id} item={s} />
					))}
				</ul>
			)}

			<VersionFooter version={data.version} />
		</div>
	);
}

function VersionFooter({ version }: { version: VersionInfo }) {
	const hasVersion = Boolean(version?.timestamp || version?.id);
	return (
		<footer className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-3">
			{version?.timestamp ? (
				<span title={version.id}>
					{version?.tag && <span className="font-medium">v{version.tag} </span>}
					{formatDateTime(version.timestamp)}
				</span>
			) : null}
			{!version?.timestamp && version?.id ? (
				<span title={version.id}>{version.id.slice(0, 8)}</span>
			) : null}
			{hasVersion ? <span aria-hidden="true">·</span> : null}
			<a
				href="https://github.com/frkr/flower-audit"
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
				aria-label="Repositório no GitHub"
			>
				<GitHubIcon />
				<span>GitHub</span>
			</a>
		</footer>
	);
}

function GitHubIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
			<li className="group border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between gap-4 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2 mb-0.5">
						<code className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
							{item.name}
						</code>
						{secret && (
							<Badge variant="secondary" className="text-xs">
								secret
							</Badge>
						)}
					</div>
					<div className="text-sm font-mono text-slate-900 dark:text-slate-50 break-all">
						{maskValue(item.name, item.value)}
					</div>
					{item.description ? (
						<p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.description}</p>
					) : null}
				</div>
				<div className="flex gap-1 shrink-0">
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => setEditing(true)}
					>
						Editar
					</Button>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={() => setConfirmDelete(true)}
						className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-opacity"
					>
						Excluir
					</Button>
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
		<li className="border border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm">
			<Form method="post" className="space-y-3" onSubmit={() => setEditing(false)}>
				<input type="hidden" name="intent" value="upsert" />
				<input type="hidden" name="id" value={item.id} />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<label className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
							Nome (chave)
						</label>
						<Input name="name" defaultValue={item.name} required />
					</div>
					<div className="space-y-1.5">
						<label className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
							Valor
						</label>
						<Input
							name="value"
							type={secret ? "password" : "text"}
							defaultValue={secret ? "" : item.value}
							placeholder={secret ? "(novo valor — atual oculto)" : undefined}
							autoComplete={secret ? "new-password" : undefined}
							className="font-mono"
						/>
					</div>
				</div>
				<div className="space-y-1.5">
					<label className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
						Descrição
					</label>
					<Input name="description" defaultValue={item.description} />
				</div>
				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
						Cancelar
					</Button>
					<Button type="submit" size="sm">
						Salvar
					</Button>
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
