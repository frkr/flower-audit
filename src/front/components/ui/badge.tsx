import * as React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success";

const variantStyles: Record<BadgeVariant, string> = {
	default:
		"border-transparent bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900",
	secondary:
		"border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50",
	destructive:
		"border-transparent bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:text-red-50",
	outline: "border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-50",
	success:
		"border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-50",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
				variantStyles[variant],
				className
			)}
			{...props}
		/>
	);
}

export { Badge };
