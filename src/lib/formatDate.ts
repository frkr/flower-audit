// Helper único de formatação de datas exibidas para o usuário.
// Regra do AGENTS.md: data → dd/MM/yyyy ; data+hora → dd/MM/yyyy HH:mm.
// O banco grava em UTC (datetime('now')); a formatação usa America/Sao_Paulo
// para que SSR e CSR produzam o mesmo texto (sem mismatch de hidratação).

const TZ = "America/Sao_Paulo";

function toDate(iso: string | null | undefined): Date | null {
	if (!iso) return null;
	const s = iso.includes("T") ? iso : iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z");
	const d = new Date(s);
	return Number.isNaN(d.getTime()) ? null : d;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: TZ,
});

const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
	timeZone: TZ,
});

export function formatDate(iso: string | null | undefined): string {
	const d = toDate(iso);
	return d ? dateFmt.format(d) : "";
}

export function formatDateTime(iso: string | null | undefined): string {
	const d = toDate(iso);
	if (!d) return "";
	return dateTimeFmt.format(d).replace(", ", " ");
}
