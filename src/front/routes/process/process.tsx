import { Form, Link, useLoaderData, useSearchParams, useSubmit } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "@/ConfirmModal";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent } from "@/ui/card";
import type { Route } from "./+types/process";
import type { ProcessRow } from "./process.server";
import { systemNameFromMatches } from "../../lib/systemName";
import { formatDateTime } from "../../lib/formatDate";
import { cn } from "../../lib/utils";

export { loader, action } from "./process.server";

export function meta({ matches }: Route.MetaArgs) {
	return [{ title: `${systemNameFromMatches(matches)} — Processes` }];
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
	const submit = useSubmit();
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);
	const { t } = useTranslation();

	return (
		<div className="max-w-4xl mx-auto space-y-4">
			<div className="flex items-center gap-3">
				<Form method="get" className="flex-1 flex gap-2">
					<Input name="q" defaultValue={data.q} placeholder={t("process.searchPlaceholder")} className="flex-1" />
					<Button type="submit" variant="secondary">
						{t("process.search")}
					</Button>
				</Form>
				<Button
					type="button"
					onClick={() => setCreating((v) => !v)}
					variant={creating ? "outline" : "default"}
				>
					{creating ? t("process.cancel") : t("process.newProcess")}
				</Button>
			</div>

			{creating ? (
				<Card>
					<CardContent className="pt-6">
						<Form method="post" className="space-y-4">
							<input type="hidden" name="intent" value="create" />
							<div className="space-y-1.5">
								<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									{t("process.processName")}
								</label>
								<Input name="name" required placeholder={t("process.namePlaceholder")} />
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									{t("process.description")}
								</label>
								<textarea
									id="proc-desc"
									name="description"
									className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-300"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
									{t("process.flowOptional")}
								</label>
								<select
									id="proc-fluxo"
									name="id_fluxo"
									className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-slate-300"
								>
									<option value="">{t("process.noFlow")}</option>
									{data.fluxes.map((f) => (
										<option key={f.id} value={f.id}>
											{f.name}
										</option>
									))}
								</select>
							</div>
							<div className="flex gap-2">
								<Button type="submit">{t("process.createProcess")}</Button>
								<Button type="button" variant="outline" onClick={() => setCreating(false)}>
									{t("process.cancel")}
								</Button>
							</div>
						</Form>
					</CardContent>
				</Card>
			) : null}

			{data.items.length === 0 ? (
				<div className="text-center py-12 text-slate-500 dark:text-slate-400">
					<p className="text-sm">{t("process.noProcesses")}</p>
				</div>
			) : (
				<ul className="space-y-2">
					{data.items.map((p) => (
						<li
							key={p.id}
							className="group border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 flex justify-between items-center bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow"
						>
							<div className="min-w-0 flex-1">
								<Link
									to={`/process/${p.id}`}
									className="font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
								>
									{p.name}
								</Link>
								{p.description ? (
									<p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
										{p.description}
									</p>
								) : null}
								<p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
									{t("process.updated")} {formatDateTime(p.updated_at)}
								</p>
							</div>
							<Button
								type="button"
								size="sm"
								variant="ghost"
								onClick={() => setPendingDelete(p.id)}
								className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								{t("process.delete")}
							</Button>
						</li>
					))}
				</ul>
			)}

			{totalPages > 1 ? (
				<div className="flex justify-center gap-1 pt-2">
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button
							key={p}
							onClick={() => {
								const next = new URLSearchParams(params);
								next.set("page", String(p));
								setParams(next);
							}}
							className={cn(
								"h-8 w-8 rounded-md text-sm font-medium transition-colors",
								p === data.page
									? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
									: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
							)}
						>
							{p}
						</button>
					))}
				</div>
			) : null}

			{pendingDelete && (
				<ConfirmModal
					message={t("process.deleteConfirm")}
					onConfirm={() => {
						submit({ intent: "delete", id: pendingDelete }, { method: "post" });
						setPendingDelete(null);
					}}
					onCancel={() => setPendingDelete(null)}
				/>
			)}
		</div>
	);
}
