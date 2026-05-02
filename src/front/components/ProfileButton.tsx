import { useState } from "react";
import { Separator } from "./ui/separator";
import type { SessionUser } from "../lib/auth.server";

export function ProfileButton({ user }: { user: SessionUser }) {
	const [open, setOpen] = useState(false);
	const initials = (user.name || user.email || "?")
		.split(/\s+/)
		.map((p) => p[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 overflow-hidden transition-all"
				aria-label="Perfil"
				title={user.email}
			>
				{user.picture ? (
					<img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
				) : (
					<span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
						{initials}
					</span>
				)}
			</button>

			{open ? (
				<>
					<div
						className="fixed inset-0 z-20"
						onClick={() => setOpen(false)}
						aria-hidden="true"
					/>
					<div className="absolute bottom-11 right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-sm z-30">
						<div className="flex items-center gap-3 mb-3">
							{user.picture ? (
								<img
									src={user.picture}
									alt={user.name}
									className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
									{initials}
								</div>
							)}
							<div className="min-w-0">
								<p className="font-semibold text-slate-900 dark:text-slate-50 truncate">
									{user.name}
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400 truncate">
									{user.email}
								</p>
							</div>
						</div>
						<Separator className="mb-3" />
						<a
							href="/logout"
							className="flex items-center justify-center gap-2 w-full text-center text-sm px-3 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							Sair
						</a>
					</div>
				</>
			) : null}
		</div>
	);
}
