import { useState } from "react";

export function ProfileButton() {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:ring-2 hover:ring-blue-400"
				aria-label="Perfil"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
			</button>
			{open ? (
				<div className="absolute bottom-12 right-0 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
					<div className="font-medium">Usuário</div>
					<div className="text-xs text-gray-500">Perfil</div>
					<hr className="my-2 border-gray-200 dark:border-gray-700" />
					<button className="text-xs hover:underline" onClick={() => setOpen(false)}>
						Fechar
					</button>
				</div>
			) : null}
		</div>
	);
}
