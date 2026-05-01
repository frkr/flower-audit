import { useEffect, useMemo, useState } from "react";

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
				className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
			</button>

			{open ? (
				<div className="absolute right-0 mt-2 w-72 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
					<div className="flex items-center justify-between mb-2">
						<button
							type="button"
							className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
							onClick={() => {
								if (month === 1) {
									setMonth(12);
									setYear(year - 1);
								} else setMonth(month - 1);
							}}
						>
							‹
						</button>
						<div className="text-sm capitalize">
							{monthName} {year}
						</div>
						<button
							type="button"
							className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
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
					<div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500">
						{["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
							<div key={i}>{d}</div>
						))}
					</div>
					<div className="grid grid-cols-7 gap-1 mt-1">
						{grid.map((cell, idx) => (
							<div
								key={idx}
								title={cell ? `${cell.date}: ${cell.total} fluxo(s)` : ""}
								className={
									"aspect-square text-xs flex items-center justify-center rounded " +
									(cell
										? cell.total >= 5
											? "bg-blue-700 text-white"
											: cell.total > 1
												? "bg-blue-300 text-blue-900"
												: cell.total === 1
													? "bg-blue-50 text-blue-900"
													: "text-gray-700 dark:text-gray-300"
										: "")
								}
							>
								{cell ? cell.day : ""}
							</div>
						))}
					</div>
				</div>
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
