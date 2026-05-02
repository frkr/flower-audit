import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";

type DayCount = { day: string; total: number };

export function CalendarPanel() {
	const today = new Date();
	const [year, setYear] = useState(today.getUTCFullYear());
	const [month, setMonth] = useState(today.getUTCMonth() + 1);
	const [days, setDays] = useState<DayCount[]>([]);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const ctrl = new AbortController();
		fetch(`/api/calendar?year=${year}&month=${month}`, { signal: ctrl.signal })
			.then((r) => r.json() as Promise<{ days: DayCount[] }>)
			.then((d) => setDays(d.days ?? []))
			.catch(() => {});
		return () => ctrl.abort();
	}, [year, month, open]);

	const grid = useMemo(() => buildGrid(year, month, days), [year, month, days]);
	const monthName = new Date(year, month - 1, 1).toLocaleString("pt-BR", { month: "long" });

	return (
		<div className="relative">
			<button
				type="button"
				aria-label="Abrir calendário"
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"p-1.5 rounded-md border transition-colors",
					open
						? "border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800"
						: "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
				)}
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="text-slate-500 dark:text-slate-400"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
			</button>

			{open ? (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setOpen(false)}
						aria-hidden="true"
					/>
					<div className="absolute right-0 mt-2 w-72 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3">
						<div className="flex items-center justify-between mb-3">
							<button
								type="button"
								className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
								onClick={() => {
									if (month === 1) {
										setMonth(12);
										setYear(year - 1);
									} else setMonth(month - 1);
								}}
							>
								‹
							</button>
							<span className="text-sm font-medium capitalize text-slate-900 dark:text-slate-50">
								{monthName} {year}
							</span>
							<button
								type="button"
								className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
								onClick={() => {
									if (month === 12) {
										setMonth(1);
										setYear(year + 1);
									} else setMonth(month + 1);
								}}
							>
								›
							</button>
						</div>

						<div className="grid grid-cols-7 gap-1 text-xs text-center text-slate-400 dark:text-slate-500 mb-1">
							{["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
								<div key={i} className="font-medium">
									{d}
								</div>
							))}
						</div>

						<div className="grid grid-cols-7 gap-1">
							{grid.map((cell, idx) => (
								<div
									key={idx}
									title={cell ? `${cell.date}: ${cell.total} fluxo(s)` : ""}
									className={cn(
										"aspect-square text-xs flex items-center justify-center rounded-md transition-colors",
										cell
											? cell.total >= 5
												? "bg-blue-600 text-white font-medium"
												: cell.total > 1
													? "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-50"
													: cell.total === 1
														? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
														: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
											: ""
									)}
								>
									{cell ? cell.day : ""}
								</div>
							))}
						</div>

						<div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400">
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 rounded-sm bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800" />
								<span>1</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-800" />
								<span>2–4</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 rounded-sm bg-blue-600" />
								<span>5+</span>
							</div>
						</div>
					</div>
				</>
			) : null}
		</div>
	);
}

function buildGrid(year: number, month: number, days: DayCount[]) {
	const counts = new Map(days.map((d) => [d.day, d.total]));
	const first = new Date(Date.UTC(year, month - 1, 1));
	const startWeekday = first.getUTCDay();
	const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
	const cells: ({ day: number; total: number; date: string } | null)[] = [];
	for (let i = 0; i < startWeekday; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) {
		const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
		cells.push({ day: d, total: counts.get(date) ?? 0, date });
	}
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}
