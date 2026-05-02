import { Modal } from "./Modal";

export function ConfirmModal({
	message,
	onConfirm,
	onCancel,
}: {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Modal onClose={onCancel}>
			<p className="text-sm mb-5">{message}</p>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					autoFocus
					className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					Cancelar
				</button>
				<button
					type="button"
					onClick={onConfirm}
					className="px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
				>
					Confirmar
				</button>
			</div>
		</Modal>
	);
}
