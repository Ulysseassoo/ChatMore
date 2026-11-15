import { expect, test } from "@playwright/test";
import { createUser, login } from "./helpers";

test("un écran qui ne se charge pas affiche une page d'erreur, la navigation reste disponible", async ({ page }) => {
	await login(page, await createUser("panne"));
	await page.route(/NewChat/, (route) => route.abort());

	await page.getByRole("link", { name: "Nouvelle discussion" }).first().click();
	await expect(page.getByRole("alert")).toContainText("Une nouvelle version de ChatMore est disponible");
	await expect(page.getByRole("button", { name: "Recharger" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
});
