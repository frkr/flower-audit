import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SessionUser } from "../lib/auth.server";
import { supportedLngs, localeNames, LANG_COOKIE } from "../i18n/i18n";

export function ProfileButton({ user }: { user: SessionUser }) {
	const [open, setOpen] = useState(false);
	const { t, i18n } = useTranslation();
	const initials = (user.name || user.email || "?")
		.split(/\s+/)
		.map((p) => p[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	function changeLanguage(lng: string) {
		const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
		document.cookie = `${LANG_COOKIE}=${lng}; path=/; expires=${expires}; SameSite=Lax`;
		i18n.changeLanguage(lng);
	}

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:ring-2 hover:ring-blue-400 overflow-hidden"
				aria-label={t("profile.label")}
				title={user.email}
			>
				{user.picture ? (
					<img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
				) : (
					<span className="text-sm font-semibold">{initials}</span>
				)}
			</button>
			{open ? (
				<div className="absolute bottom-12 right-0 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm z-30">
					<div className="flex items-center gap-3">
						{user.picture ? (
							<img
								src={user.picture}
								alt={user.name}
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold">
								{initials}
							</div>
						)}
						<div className="min-w-0">
							<div className="font-medium truncate">{user.name}</div>
							<div className="text-xs text-gray-500 truncate">{user.email}</div>
						</div>
					</div>
					<hr className="my-2 border-gray-200 dark:border-gray-700" />
					<div className="mb-2">
						<label className="block text-xs text-gray-500 mb-1">{t("profile.language")}</label>
						<select
							value={i18n.language}
							onChange={(e) => changeLanguage(e.target.value)}
							className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
						>
							{supportedLngs.map((lng) => (
								<option key={lng} value={lng}>
									{localeNames[lng]}
								</option>
							))}
						</select>
					</div>
					<hr className="my-2 border-gray-200 dark:border-gray-700" />
					<a
						href="/logout"
						className="block text-center text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
					>
						{t("profile.logout")}
					</a>
				</div>
			) : null}
		</div>
	);
}
