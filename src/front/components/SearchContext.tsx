import { createContext, useContext, useState, type ReactNode } from "react";

type SearchState = {
	collapsed: boolean;
	setCollapsed: (v: boolean) => void;
	query: string;
	setQuery: (q: string) => void;
};

const Ctx = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
	const [collapsed, setCollapsed] = useState(false);
	const [query, setQuery] = useState("");
	return <Ctx.Provider value={{ collapsed, setCollapsed, query, setQuery }}>{children}</Ctx.Provider>;
}

export function useSearch(): SearchState {
	const v = useContext(Ctx);
	if (!v) throw new Error("useSearch must be used inside SearchProvider");
	return v;
}
