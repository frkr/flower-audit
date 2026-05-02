import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/landing";

export { loader } from "./landing.server";

export function meta({ data }: Route.MetaArgs) {
	const systemName = (data as { systemName?: string } | undefined)?.systemName || "Flower";
	return [
		{ title: systemName },
		{ name: "description", content: `${systemName} — sistema de auditoria de fluxos e processos` },
	];
}

type Data = { systemName: string; redirectTo: string };

const features: Array<{ title: string; description: string; icon: React.ReactNode }> = [
	{
		title: "Começar",
		description: "Caixa de pesquisa centralizada que busca seus fluxos e processos em segundos.",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<circle cx="11" cy="11" r="8" />
				<path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
			</svg>
		),
	},
	{
		title: "Fluxos",
		description: "CRUD simples para criar fluxos com nome, descrição e uma lista editável de passos.",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
		),
	},
	{
		title: "Processos",
		description: "Inicie um processo a partir de um fluxo e edite o conteúdo de cada passo em um editor WYSIWYG.",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		),
	},
	{
		title: "Configuração",
		description: "Parâmetros do sistema (chave/valor) persistidos no banco para personalizar a sua instância.",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
				<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		),
	},
	{
		title: "Calendário",
		description: "Visão mensal destacando os dias em que processos foram iniciados, com intensidade por volume.",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		),
	},
	{
		title: "Chat IA",
		description: "Painel lateral pronto para conversar com uma IA sobre os fluxos e processos do sistema.",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
			</svg>
		),
	},
];

export default function Landing() {
	const { systemName, redirectTo } = useLoaderData() as Data;
	const loginHref =
		redirectTo && redirectTo !== "/"
			? `/login?redirect=${encodeURIComponent(redirectTo)}`
			: "/login";

	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
			<header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
				<div className="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-5 h-5 text-blue-600"
					>
						<path d="M12 2a10 10 0 1 0 10 10" />
						<path d="M12 8a4 4 0 0 1 4 4" />
						<circle cx="12" cy="12" r="2" />
					</svg>
					<span className="font-semibold text-slate-900 dark:text-slate-50">{systemName}</span>
				</div>
				<Link
					to={loginHref}
					className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-100"
				>
					Entrar
				</Link>
			</header>

			<main className="flex-1 flex flex-col items-center px-6 bg-slate-50 dark:bg-slate-950">
				<section className="w-full max-w-3xl text-center pt-20 pb-14">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-6 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
						<span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
						Gestão de processos simplificada
					</div>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
						Auditoria de fluxos e processos,{" "}
						<span className="text-blue-600">simples assim.</span>
					</h1>
					<p className="mt-5 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
						{systemName} ajuda você a desenhar fluxos, executar processos e manter um histórico
						auditável de cada passo — tudo em um só lugar.
					</p>
					<div className="mt-8 flex items-center justify-center gap-3">
						<Link
							to={loginHref}
							className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-100"
						>
							Começar agora
							<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
							</svg>
						</Link>
					</div>
				</section>

				<section className="w-full max-w-5xl pb-20">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((f) => (
							<div
								key={f.title}
								className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
							>
								<div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
									{f.icon}
								</div>
								<h2 className="font-semibold text-base text-slate-900 dark:text-slate-50">
									{f.title}
								</h2>
								<p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
									{f.description}
								</p>
							</div>
						))}
					</div>
				</section>
			</main>

			<footer className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
				{systemName} · Todos os direitos reservados
			</footer>
		</div>
	);
}
