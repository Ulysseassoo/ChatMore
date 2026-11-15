const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const weekday = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" });
const longDate = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const longDateYear = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY = 86_400_000;

export const formatTime = (iso: string) => time.format(new Date(iso));

export const dayKey = (iso: string) => {
	const d = new Date(iso);
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** Séparateur de jour dans une conversation : « Aujourd'hui », « Hier », « samedi 8 novembre »… */
export function formatDayLabel(iso: string, now = new Date()): string {
	const d = new Date(iso);
	const diff = Math.round((startOfDay(now) - startOfDay(d)) / DAY);
	if (diff === 0) return "Aujourd'hui";
	if (diff === 1) return "Hier";
	const label = d.getFullYear() === now.getFullYear() ? longDate.format(d) : longDateYear.format(d);
	return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Horodatage dans la liste des discussions : « 14:32 », « Hier », « mar. », « 02/11 ». */
export function formatListTime(iso: string, now = new Date()): string {
	const d = new Date(iso);
	const diff = Math.round((startOfDay(now) - startOfDay(d)) / DAY);
	if (diff === 0) return time.format(d);
	if (diff === 1) return "Hier";
	if (diff < 7) {
		const w = weekday.format(d);
		return w.charAt(0).toUpperCase() + w.slice(1);
	}
	return shortDate.format(d);
}
