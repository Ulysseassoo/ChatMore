import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

export type AuthState = { status: "loading" } | { status: "signedOut" } | { status: "signedIn"; session: Session };

export const useAuth = create<AuthState>(() => ({ status: "loading" }));

export const useUserId = () => useAuth((s) => (s.status === "signedIn" ? s.session.user.id : null));

export function useRequiredUserId(): string {
	const id = useUserId();
	if (!id) throw new Error("useRequiredUserId appelé hors d'une zone protégée");
	return id;
}
