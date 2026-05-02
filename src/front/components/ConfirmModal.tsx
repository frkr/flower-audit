import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./ui/button";

export function ConfirmModal({
	message,
	onConfirm,
	onCancel,
}: {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	const { t } = useTranslation();
	return (
		<Modal onClose={onCancel}>
			<div className="flex items-start gap-3 mb-4">
				<div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-4 h-4 text-red-600 dark:text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("modal.confirmTitle")}</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" size="sm" onClick={onCancel} autoFocus>
					{t("modal.cancel")}
				</Button>
				<Button type="button" variant="destructive" size="sm" onClick={onConfirm}>
					{t("modal.confirm")}
				</Button>
			</div>
		</Modal>
	);
}
