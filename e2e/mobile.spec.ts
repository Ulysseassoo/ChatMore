import { expect, test } from "@playwright/test";
import { createUser, login, messageLog, openDirectChat } from "./helpers";

test("mobile : une vue à la fois, retour à la liste", async ({ page }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	await login(page, alice);
	await openDirectChat(page, bob.username);
	await expect(page.getByRole("heading", { name: "Discussions" })).toBeHidden();

	await page.getByRole("link", { name: "Retour aux discussions" }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
});

test("mobile : le clavier ne masque ni la saisie ni la fin de la conversation", async ({ page }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	await login(page, alice);
	await openDirectChat(page, bob.username);

	const input = page.getByLabel("Message", { exact: true });
	await input.click();
	const { width, height } = page.viewportSize()!;
	await page.setViewportSize({ width, height: height - 300 });

	const box = (await input.boundingBox())!;
	expect(box.y + box.height).toBeLessThanOrEqual(height - 300);
	await expect(page.getByRole("banner")).toBeInViewport();
	expect(await messageLog(page).evaluate((el) => Math.abs(el.scrollTop))).toBeLessThan(5);
	expect(await page.evaluate(() => document.scrollingElement!.scrollTop)).toBe(0);

	await input.fill("Bonjour");
	await input.press("Enter");
	await expect(input, "sur mobile, Entrée va à la ligne au lieu d'envoyer").toHaveValue("Bonjour\n");
});
