import { Form, Link, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/welcome";
import type { RecentRow } from "./welcome.server";
import { systemNameFromMatches } from "../../lib/systemName";
import { formatDateTime } from "../../lib/formatDate";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";

export { loader } from "./welcome.server";

export function meta({ matches }: Route.MetaArgs) {
	return [
		{ title: systemNameFromMatches(matches) },
		{ name: "description", content: "Recent flows and processes" },
	];
}

type Data = {
	fluxes: RecentRow[];
	processes: RecentRow[];
};

export default function Welcome() {
	const { fluxes, processes } = useLoaderData() as Data;
	const { t } = useTranslation();

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			<section>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
						{t("welcome.recentFlows")}
					</h2>
					<Link
						to="/flow"
						className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						{t("welcome.viewAll")}
					</Link>
				</div>
				{fluxes.length === 0 ? (
					<EmptyHint label={t("welcome.noFlows")} actionLabel={t("welcome.createFlow")} actionTo="/flow" />
				) : (
					<ul className="space-y-2">
						{fluxes.map((f) => (
							<li
								key={f.id}
								className="border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 flex justify-between items-center gap-3 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow"
							>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2 mb-0.5">
										<Badge variant="secondary" className="text-xs">{t("welcome.flow")}</Badge>
									</div>
									<Link
										to={`/flow/${f.id}`}
										className="font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
									>
										{f.name}
									</Link>
									{f.description ? (
										<p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
											{f.description}
										</p>
									) : null}
								</div>
								<Form method="post" action="/process">
									<input type="hidden" name="intent" value="startFromFlow" />
									<input type="hidden" name="id_fluxo" value={f.id} />
									<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
										{t("welcome.start")}
									</Button>
								</Form>
							</li>
						))}
					</ul>
				)}
			</section>

			<section>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
						{t("welcome.recentProcesses")}
					</h2>
					<Link
						to="/process"
						className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						{t("welcome.viewAll")}
					</Link>
				</div>
				{processes.length === 0 ? (
					<EmptyHint label={t("welcome.noProcesses")} />
				) : (
					<ul className="space-y-2">
						{processes.map((p) => (
							<li
								key={p.id}
								className="border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow"
							>
								<div className="flex items-center gap-2 mb-0.5">
									<Badge variant="outline" className="text-xs">{t("welcome.process")}</Badge>
								</div>
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
								<p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
									{t("welcome.updated")} {formatDateTime(p.updated_at)}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}

function EmptyHint({
	label,
	actionLabel,
	actionTo,
}: {
	label: string;
	actionLabel?: string;
	actionTo?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
			<span>{label}</span>
			{actionLabel && actionTo ? (
				<Link to={actionTo}>
					<Button size="sm">{actionLabel}</Button>
				</Link>
			) : null}
		</div>
	);
}
