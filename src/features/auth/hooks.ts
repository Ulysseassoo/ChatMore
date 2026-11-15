import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { isUsernameAvailable } from "./api";

export const USERNAME_PATTERN = /^[a-z0-9._]{3,24}$/;

export type UsernameCheck = "idle" | "invalid" | "checking" | "available" | "taken" | "unchanged";

export function useUsernameCheck(value: string, current?: string): UsernameCheck {
	const normalized = value.trim().toLowerCase();
	const debounced = useDebouncedValue(normalized, 350);
	const valid = USERNAME_PATTERN.test(debounced);
	const unchanged = !!current && debounced === current;

	const query = useQuery({
		queryKey: ["username-available", debounced],
		queryFn: () => isUsernameAvailable(debounced),
		enabled: valid && !unchanged,
		staleTime: 10_000,
	});

	if (!normalized) return "idle";
	if (normalized !== debounced) return "checking";
	if (!valid) return "invalid";
	if (unchanged) return "unchanged";
	if (query.isPending) return "checking";
	return query.data ? "available" : "taken";
}

export function passwordStrength(password: string): { score: number; label: string } {
	if (!password) return { score: 0, label: "" };
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[a-z]/i.test(password) && /\d/.test(password)) score++;
	if (/[^a-z0-9]/i.test(password) || /[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (password.length < 8) return { score: 1, label: "Trop court : 8 caractères minimum." };
	const labels = ["", "Faible.", "Moyen : ajoute un symbole ou une majuscule pour le renforcer.", "Bon.", "Excellent."];
	return { score, label: labels[score] ?? "" };
}
