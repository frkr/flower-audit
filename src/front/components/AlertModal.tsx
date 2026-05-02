import { Modal } from "./Modal";

export function AlertModal({ message, onClose }: { message: string; onClose: () => void }) {
	return (
		<Modal onClose={onClose}>
			<p className="text-sm mb-5">{message}</p>
			<div className="flex justify-end">
				<button
					type="button"
					onClick={onClose}
					autoFocus
					className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
				>
					OK
				</button>
			</div>
		</Modal>
	);
}
