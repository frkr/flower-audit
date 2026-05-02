import * as React from "react";
import { cn } from "../../lib/utils";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
	React.useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onOpenChange(false);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open, onOpenChange]);

	if (!open) return null;
	return <>{children}</>;
}

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, onClick, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
			onClick={onClick}
			{...props}
		/>
	)
);
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
	<div
		className="fixed inset-0 z-50 flex items-center justify-center p-4"
		onClick={(e) => {
			if (e.target === e.currentTarget) onClose?.();
		}}
	>
		<DialogOverlay className="absolute inset-0" onClick={onClose} />
		<div
			ref={ref}
			role="dialog"
			aria-modal="true"
			className={cn(
				"relative z-50 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900",
				className
			)}
			{...props}
		>
			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 rounded-sm p-1 text-slate-500 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-slate-400 dark:ring-offset-slate-950 dark:focus:ring-slate-300"
					aria-label="Fechar"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			)}
			{children}
		</div>
	</div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4", className)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h2
			ref={ref}
			className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50", className)}
			{...props}
		/>
	)
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p ref={ref} className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
