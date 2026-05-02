export function systemNameFromMatches(
	matches: ReadonlyArray<{ id: string; data: unknown } | undefined>,
): string {
	const layout = matches.find((m) => m?.id === "layouts/app");
	const data = layout?.data as { systemName?: string } | undefined;
	return data?.systemName?.trim() || "Flower";
}
