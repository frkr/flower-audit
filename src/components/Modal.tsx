import { useEffect } from "react";

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
				{children}
			</div>
		</div>
	);
}
