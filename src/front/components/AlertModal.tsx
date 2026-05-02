import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./ui/button";

export function AlertModal({ message, onClose }: { message: string; onClose: () => void }) {
	const { t } = useTranslation();
	return (
		<Modal onClose={onClose}>
			<div className="flex items-start gap-3 mb-4">
				<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-4 h-4 text-blue-600 dark:text-blue-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("modal.warningTitle")}</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
				</div>
			</div>
			<div className="flex justify-end">
				<Button type="button" size="sm" onClick={onClose} autoFocus>
					{t("modal.ok")}
				</Button>
			</div>
		</Modal>
	);
}
