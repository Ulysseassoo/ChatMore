import type { AuthError } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./session";

/**
 * Le seul écouteur d'authentification de l'app. Il reçoit la session initiale,
 * les connexions, les rafraîchissements de jeton et la déconnexion.
 */
export function startAuthListener(queryClient: QueryClient) {
	const { data } = supabase.auth.onAuthStateChange((event, session) => {
		if (event === "SIGNED_OUT") {
			queryClient.clear(); // plus aucune donnée de l'utilisateur précédent
			void supabase.removeAllChannels(); // plus aucun abonnement temps réel
		}
		useAuth.setState(session ? { status: "signedIn", session } : { status: "signedOut" }, true);
	});
	return () => data.subscription.unsubscribe();
}

const redirectTo = () => `${window.location.origin}/`;

export async function signIn(email: string, password: string) {
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
}

export async function sendMagicLink(email: string) {
	const { error } = await supabase.auth.signInWithOtp({
		email,
		options: { shouldCreateUser: false, emailRedirectTo: redirectTo() },
	});
	if (error) throw error;
}

/** Renvoie true si une confirmation par e-mail est nécessaire. */
export async function signUp(input: { email: string; password: string; username: string }) {
	const { data, error } = await supabase.auth.signUp({
		email: input.email,
		password: input.password,
		options: { data: { username: input.username }, emailRedirectTo: redirectTo() },
	});
	if (error) throw error;
	return data.session === null;
}

export async function resendConfirmation(email: string) {
	const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo() } });
	if (error) throw error;
}

export async function resetPassword(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/reset-password`,
	});
	if (error) throw error;
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function isUsernameAvailable(username: string) {
	const { data, error } = await supabase.rpc("is_username_available", { p_username: username });
	if (error) throw error;
	return data;
}

/** Messages d'erreur d'authentification compréhensibles, en français. */
export function authErrorMessage(error: unknown): string {
	const e = error as Partial<AuthError> & { message?: string };
	switch (e.code) {
		case "invalid_credentials":
			return "E-mail ou mot de passe incorrect.";
		case "email_not_confirmed":
			return "Confirme d'abord ton adresse e-mail (regarde ta boîte de réception).";
		case "user_already_exists":
		case "email_exists":
			return "Un compte existe déjà avec cette adresse.";
		case "weak_password":
			return "Mot de passe trop faible : 8 caractères minimum, avec des lettres et des chiffres.";
		case "over_email_send_rate_limit":
		case "over_request_rate_limit":
			return "Trop de tentatives. Patiente un peu avant de réessayer.";
		case "otp_disabled":
		case "user_not_found":
			return "Aucun compte ne correspond à cette adresse.";
	}
	if (e.message?.includes("Database error saving new user")) return "Ce nom d'utilisateur est déjà pris.";
	if (e.message?.toLowerCase().includes("fetch")) return "Connexion impossible. Vérifie ta connexion Internet.";
	return e.message || "Une erreur est survenue. Réessaie.";
}

export async function updatePassword(password: string) {
	const { error } = await supabase.auth.updateUser({ password });
	if (error) throw error;
}
