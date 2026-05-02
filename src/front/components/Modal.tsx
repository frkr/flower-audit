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
			className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
				{children}
			</div>
		</div>
	);
}
