import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const base =
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-slate-300";

const variantStyles: Record<ButtonVariant, string> = {
	default:
		"bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-100",
	destructive:
		"bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-800",
	outline:
		"border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-50",
	secondary:
		"bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
	ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-50",
	link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50 px-0 h-auto",
};

const sizeStyles: Record<ButtonSize, string> = {
	default: "h-10 px-4 py-2",
	sm: "h-9 rounded-md px-3 text-xs",
	lg: "h-11 rounded-md px-8",
	icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", ...props }, ref) => (
		<button
			ref={ref}
			className={cn(base, variantStyles[variant], sizeStyles[size], className)}
			{...props}
		/>
	)
);
Button.displayName = "Button";

export { Button };
