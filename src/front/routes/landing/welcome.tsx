import { Form, Link, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/welcome";
import type { RecentRow } from "./welcome.server";
import { systemNameFromMatches } from "../../lib/systemName";
import { formatDateTime } from "../../lib/formatDate";

export { loader } from "./welcome.server";

export function meta({ matches }: Route.MetaArgs) {
	return [
		{ title: systemNameFromMatches(matches) },
		{ name: "description", content: "Recently modified flows and processes" },
	];
}

type Data = {
	fluxes: RecentRow[];
	processes: RecentRow[];
};

export default function Welcome() {
	const { t } = useTranslation();
	const { fluxes, processes } = useLoaderData() as Data;

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<section>
				<div className="flex items-baseline justify-between mb-2">
					<h2 className="text-base font-semibold">{t("welcome.recentFlows")}</h2>
					<Link to="/flow" className="text-xs text-blue-600 hover:underline">
						{t("welcome.viewAll")}
					</Link>
				</div>
				{fluxes.length === 0 ? (
					<EmptyHint
						label={t("welcome.emptyFlows")}
						actionLabel={t("welcome.createFlow")}
						actionTo="/flow"
					/>
				) : (
					<ul className="space-y-2">
						{fluxes.map((f) => (
							<li
								key={f.id}
								className="border border-gray-200 dark:border-gray-700 rounded p-3 flex justify-between items-start gap-3"
							>
								<div className="min-w-0">
									<div className="text-xs uppercase text-gray-500">{t("welcome.flowBadge")}</div>
									<Link to={`/flow/${f.id}`} className="text-blue-600 hover:underline font-medium">
										{f.name}
									</Link>
									{f.description ? (
										<div className="text-sm text-gray-600 dark:text-gray-400">{f.description}</div>
									) : null}
								</div>
								<Form method="post" action="/process">
									<input type="hidden" name="intent" value="startFromFlow" />
									<input type="hidden" name="id_fluxo" value={f.id} />
									<button className="whitespace-nowrap text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">
										{t("welcome.startProcess")}
									</button>
								</Form>
							</li>
						))}
					</ul>
				)}
			</section>

			<section>
				<div className="flex items-baseline justify-between mb-2">
					<h2 className="text-base font-semibold">{t("welcome.recentProcesses")}</h2>
					<Link to="/process" className="text-xs text-blue-600 hover:underline">
						{t("welcome.viewAll")}
					</Link>
				</div>
				{processes.length === 0 ? (
					<EmptyHint label={t("welcome.emptyProcesses")} />
				) : (
					<ul className="space-y-2">
						{processes.map((p) => (
							<li
								key={p.id}
								className="border border-gray-200 dark:border-gray-700 rounded p-3"
							>
								<div className="text-xs uppercase text-gray-500">{t("welcome.processBadge")}</div>
								<Link to={`/process/${p.id}`} className="text-blue-600 hover:underline font-medium">
									{p.name}
								</Link>
								{p.description ? (
									<div className="text-sm text-gray-600 dark:text-gray-400">{p.description}</div>
								) : null}
								<div className="text-xs text-gray-500 mt-1">{t("welcome.updated", { date: formatDateTime(p.updated_at) })}</div>
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
		<div className="text-sm text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded p-4 flex items-center justify-between gap-3">
			<span>{label}</span>
			{actionLabel && actionTo ? (
				<Link to={actionTo} className="text-xs px-3 py-1 rounded bg-blue-600 text-white">
					{actionLabel}
				</Link>
			) : null}
		</div>
	);
}
