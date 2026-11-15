import { expect, test, type Page } from "@playwright/test";
import { createUser, messageLog, newSession, openDirectChat, sendMessage } from "./helpers";

const bubble = (page: Page, text: string) => messageLog(page).locator(`span:text-is(${JSON.stringify(text)})`);

test("hors ligne : le message attend le réseau puis part tout seul", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	const b = await newSession(browser, bob);
	await b.getByRole("link", { name: new RegExp(alice.username) }).click();

	await a.context().setOffline(true);
	await expect(a.getByText("Hors ligne. Tes messages partiront dès le retour du réseau.")).toBeVisible();
	await sendMessage(a, "Écrit dans le métro");
	await expect(bubble(a, "Écrit dans le métro")).toBeVisible();
	await expect(a.getByText("En attente du réseau")).toBeVisible();
	await expect(a.getByText("Non envoyé")).toHaveCount(0);

	await a.context().setOffline(false);
	await expect(bubble(b, "Écrit dans le métro"), "envoyé automatiquement au retour du réseau").toBeVisible();
	await expect(a.getByText("En attente du réseau")).toHaveCount(0);
	await expect(messageLog(a).locator(`span:text-is("Écrit dans le métro")`)).toHaveCount(1);
});

test("l'historique reste consultable quand le serveur est injoignable", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	await sendMessage(a, "Message gardé en cache");
	await expect(a.getByLabel("Envoyé").last()).toBeVisible();
	await a.waitForTimeout(1_500);

	await a.route(/127\.0\.0\.1:54321/, (route) => route.abort());
	await a.reload();
	await expect(a.getByRole("complementary").getByRole("link", { name: new RegExp(bob.username) })).toBeVisible();
	await expect(bubble(a, "Message gardé en cache")).toBeVisible();
});

test("la déconnexion efface le cache de l'appareil", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	await sendMessage(a, "Secret");
	await a.waitForTimeout(1_500);
	expect(await a.evaluate(() => localStorage.getItem("cm.cache"))).toContain("Secret");

	await a.goto("/settings");
	await a.getByRole("button", { name: "Se déconnecter" }).click();
	await expect(a).toHaveURL(/\/login/);
	await expect.poll(() => a.evaluate(() => localStorage.getItem("cm.cache") ?? "")).not.toContain("Secret");
});
