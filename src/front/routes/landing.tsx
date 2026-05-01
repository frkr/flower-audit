// Facade da tela pública de boas-vindas em "/landing".
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/landing";

export { loader } from "../.server/landing/landing";

export function meta({ data }: Route.MetaArgs) {
	const systemName = (data as { systemName?: string } | undefined)?.systemName || "Flower";
	return [
		{ title: systemName },
		{ name: "description", content: `${systemName} — sistema de auditoria de fluxos e processos` },
	];
}

type Data = { systemName: string; redirectTo: string };

const features: Array<{ title: string; description: string }> = [
	{
		title: "Começar",
		description: "Caixa de pesquisa centralizada que busca seus fluxos e processos em segundos.",
	},
	{
		title: "Fluxos",
		description: "CRUD simples para criar fluxos com nome, descrição e uma lista editável de passos.",
	},
	{
		title: "Processos",
		description: "Inicie um processo a partir de um fluxo e edite o conteúdo de cada passo em um editor WYSIWYG.",
	},
	{
		title: "Configuração",
		description: "Parâmetros do sistema (chave/valor) persistidos no banco para personalizar a sua instância.",
	},
	{
		title: "Calendário",
		description: "Visão mensal destacando os dias em que processos foram iniciados, com intensidade por volume.",
	},
	{
		title: "Chat IA",
		description: "Painel lateral pronto para conversar com uma IA sobre os fluxos e processos do sistema.",
	},
];

export default function Landing() {
	const { systemName, redirectTo } = useLoaderData() as Data;
	const loginHref =
		redirectTo && redirectTo !== "/"
			? `/login?redirect=${encodeURIComponent(redirectTo)}`
			: "/login";

	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
			<header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
				<span className="font-semibold text-blue-600 text-lg">{systemName}</span>
				<Link
					to={loginHref}
					className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
				>
					Entrar
				</Link>
			</header>

			<main className="flex-1 flex flex-col items-center px-6">
				<section className="w-full max-w-3xl text-center pt-20 pb-12">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
						Auditoria de fluxos e processos, simples assim.
					</h1>
					<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
						{systemName} ajuda você a desenhar fluxos, executar processos e manter um histórico
						auditável de cada passo — tudo em um só lugar.
					</p>
					<div className="mt-8">
						<Link
							to={loginHref}
							className="inline-block px-6 py-3 rounded bg-blue-600 text-white text-base font-medium hover:bg-blue-700"
						>
							Entrar
						</Link>
					</div>
				</section>

				<section className="w-full max-w-5xl pb-20">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((f) => (
							<div
								key={f.title}
								className="border border-gray-200 dark:border-gray-800 rounded-lg p-5"
							>
								<h2 className="font-semibold text-base">{f.title}</h2>
								<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
									{f.description}
								</p>
							</div>
						))}
					</div>
				</section>
			</main>

			<footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 text-center">
				{systemName}
			</footer>
		</div>
	);
}
