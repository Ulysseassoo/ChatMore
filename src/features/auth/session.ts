import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

/**
 * État d'authentification. Trois états distincts : on ne confond plus
 * « je ne sais pas encore » (loading) et « déconnecté ».
 * Seul le listener de auth/api.ts écrit dans ce store.
 */
export type AuthState = { status: "loading" } | { status: "signedOut" } | { status: "signedIn"; session: Session };

export const useAuth = create<AuthState>(() => ({ status: "loading" }));

export const useUserId = () => useAuth((s) => (s.status === "signedIn" ? s.session.user.id : null));

/** À utiliser uniquement sous ProtectedLayout, où une session existe forcément. */
export function useRequiredUserId(): string {
	const id = useUserId();
	if (!id) throw new Error("useRequiredUserId appelé hors d'une zone protégée");
	return id;
}
