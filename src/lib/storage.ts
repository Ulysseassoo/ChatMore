// Le stockage peut être indisponible (navigation privée, données bloquées).
export function readLocal<T>(key: string, fallback: T): T {
	try {
		const raw = window.localStorage.getItem(key);
		return raw === null ? fallback : (JSON.parse(raw) as T);
	} catch {
		return fallback;
	}
}

export function writeLocal(key: string, value: unknown): void {
	try {
		if (value === undefined || value === null || value === "") window.localStorage.removeItem(key);
		else window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		return;
	}
}
