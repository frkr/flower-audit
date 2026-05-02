import { Link, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/landing";

export { loader } from "./landing.server";

export function meta({ data }: Route.MetaArgs) {
	const systemName = (data as { systemName?: string } | undefined)?.systemName || "Flower";
	return [
		{ title: systemName },
		{ name: "description", content: `${systemName} — flow and process audit system` },
	];
}

type Data = { systemName: string; redirectTo: string };

export default function Landing() {
	const { t } = useTranslation();
	const { systemName, redirectTo } = useLoaderData() as Data;
	const loginHref =
		redirectTo && redirectTo !== "/"
			? `/login?redirect=${encodeURIComponent(redirectTo)}`
			: "/login";

	const features = [
		{ key: "go", title: t("landing.features.go.title"), desc: t("landing.features.go.desc") },
		{ key: "flows", title: t("landing.features.flows.title"), desc: t("landing.features.flows.desc") },
		{ key: "processes", title: t("landing.features.processes.title"), desc: t("landing.features.processes.desc") },
		{ key: "setup", title: t("landing.features.setup.title"), desc: t("landing.features.setup.desc") },
		{ key: "calendar", title: t("landing.features.calendar.title"), desc: t("landing.features.calendar.desc") },
		{ key: "chat", title: t("landing.features.chat.title"), desc: t("landing.features.chat.desc") },
	];

	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
			<header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
				<span className="font-semibold text-blue-600 text-lg">{systemName}</span>
				<Link
					to={loginHref}
					className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
				>
					{t("landing.login")}
				</Link>
			</header>

			<main className="flex-1 flex flex-col items-center px-6">
				<section className="w-full max-w-3xl text-center pt-20 pb-12">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
						{t("landing.headline")}
					</h1>
					<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
						{t("landing.subheadline", { name: systemName })}
					</p>
					<div className="mt-8">
						<Link
							to={loginHref}
							className="inline-block px-6 py-3 rounded bg-blue-600 text-white text-base font-medium hover:bg-blue-700"
						>
							{t("landing.cta")}
						</Link>
					</div>
				</section>

				<section className="w-full max-w-5xl pb-20">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((f) => (
							<div
								key={f.key}
								className="border border-gray-200 dark:border-gray-800 rounded-lg p-5"
							>
								<h2 className="font-semibold text-base">{f.title}</h2>
								<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
									{f.desc}
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
