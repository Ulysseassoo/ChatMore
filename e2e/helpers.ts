import { execSync } from "node:child_process";
import { expect, type Browser, type Page } from "@playwright/test";

export const API_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";
export const PASSWORD = "chatmore2026";

let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
function getServiceKey() {
	if (!serviceKey) {
		const env = execSync("npx supabase status -o env", { encoding: "utf8" });
		serviceKey = /^SERVICE_ROLE_KEY="?([^"\n]+)"?/m.exec(env)?.[1];
		if (!serviceKey) throw new Error("Clé service introuvable : lance `yarn db:start`.");
	}
	return serviceKey;
}

export const uniqueName = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;

export type TestUser = { email: string; username: string; password: string };

// Compte déjà confirmé : évite l'e-mail de confirmation et sa limite d'envoi.
export async function createUser(prefix = "user"): Promise<TestUser> {
	const username = uniqueName(prefix);
	const user = { email: `${username}@e2e.local`, username, password: PASSWORD };
	const key = getServiceKey();
	const res = await fetch(`${API_URL}/auth/v1/admin/users`, {
		method: "POST",
		headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			email: user.email,
			password: user.password,
			email_confirm: true,
			user_metadata: { username },
		}),
	});
	if (!res.ok) throw new Error(`Création du compte impossible : ${res.status} ${await res.text()}`);
	return user;
}

export async function login(page: Page, user: Pick<TestUser, "email" | "password">) {
	await page.goto("/login");
	await page.getByLabel("Adresse e-mail").fill(user.email);
	await page.locator("input[autocomplete=current-password]").fill(user.password);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
}

export async function newSession(browser: Browser, user: TestUser) {
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "fr-FR" });
	const page = await context.newPage();
	await login(page, user);
	return page;
}

export async function openDirectChat(page: Page, username: string) {
	await page.goto(`/new?q=${username}`);
	await page.getByRole("button", { name: new RegExp(username) }).click();
	await expect(page).toHaveURL(/\/chat\/\d+$/);
}

export async function sendMessage(page: Page, text: string) {
	await page.getByLabel("Message", { exact: true }).fill(text);
	await page.getByRole("button", { name: "Envoyer" }).click();
}

export const messageLog = (page: Page) => page.getByRole("log", { name: "Messages" });

export async function emailLink(to: string, subject: string): Promise<string> {
	let link: string | undefined;
	await expect
		.poll(
			async () => {
				const list = (await (await fetch(`${MAILPIT_URL}/api/v1/messages`)).json()) as {
					messages: { ID: string; Subject: string; To: { Address: string }[] }[];
				};
				const msg = list.messages.find(
					(m) => m.To.some((t) => t.Address === to) && m.Subject.toLowerCase().includes(subject),
				);
				if (!msg) return false;
				const full = (await (await fetch(`${MAILPIT_URL}/api/v1/message/${msg.ID}`)).json()) as {
					HTML: string;
					Text: string;
				};
				link = /href="([^"]*verify[^"]*)"/.exec(full.HTML)?.[1]?.replace(/&amp;/g, "&");
				return !!link;
			},
			{ timeout: 15_000, message: `e-mail « ${subject} » pour ${to}` },
		)
		.toBe(true);
	return link!;
}
