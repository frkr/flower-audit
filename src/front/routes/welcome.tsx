// Facade da tela de boas-vindas em "/".
import { Form, Link, useLoaderData } from "react-router";
import type { Route } from "./+types/welcome";
import type { RecentRow } from "../.server/welcome/welcome";
import { systemNameFromMatches } from "../lib/systemName";

export { loader } from "../.server/welcome/welcome";

export function meta({ matches }: Route.MetaArgs) {
	return [
		{ title: systemNameFromMatches(matches) },
		{ name: "description", content: "Últimos fluxos e processos modificados" },
	];
}

type Data = {
	fluxes: RecentRow[];
	processes: RecentRow[];
};

export default function Welcome() {
	const { fluxes, processes } = useLoaderData() as Data;

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<section>
				<div className="flex items-baseline justify-between mb-2">
					<h2 className="text-base font-semibold">Fluxos recentes</h2>
					<Link to="/flow" className="text-xs text-blue-600 hover:underline">
						Ver todos →
					</Link>
				</div>
				{fluxes.length === 0 ? (
					<EmptyHint
						label="Nenhum fluxo ainda."
						actionLabel="Criar fluxo"
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
									<div className="text-xs uppercase text-gray-500">Fluxo</div>
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
										▶ Iniciar processo
									</button>
								</Form>
							</li>
						))}
					</ul>
				)}
			</section>

			<section>
				<div className="flex items-baseline justify-between mb-2">
					<h2 className="text-base font-semibold">Processos recentes</h2>
					<Link to="/process" className="text-xs text-blue-600 hover:underline">
						Ver todos →
					</Link>
				</div>
				{processes.length === 0 ? (
					<EmptyHint label="Nenhum processo iniciado ainda." />
				) : (
					<ul className="space-y-2">
						{processes.map((p) => (
							<li
								key={p.id}
								className="border border-gray-200 dark:border-gray-700 rounded p-3"
							>
								<div className="text-xs uppercase text-gray-500">Processo</div>
								<Link to={`/process/${p.id}`} className="text-blue-600 hover:underline font-medium">
									{p.name}
								</Link>
								{p.description ? (
									<div className="text-sm text-gray-600 dark:text-gray-400">{p.description}</div>
								) : null}
								<div className="text-xs text-gray-500 mt-1">Atualizado: {p.updated_at}</div>
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
