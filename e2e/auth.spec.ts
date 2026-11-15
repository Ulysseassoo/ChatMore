import { expect, test } from "@playwright/test";
import { createUser, emailLink, login, uniqueName } from "./helpers";

test("inscription : confirmation par e-mail obligatoire avant la connexion", async ({ page }) => {
	const username = uniqueName("nina");
	const email = `${username}@e2e.local`;

	await page.goto("/register");
	await page.getByLabel("Nom d'utilisateur").fill(username);
	await expect(page.getByText("Disponible")).toBeVisible();
	await page.getByLabel("Adresse e-mail").fill(email);
	await page.locator("input[autocomplete=new-password]").fill("soleil2026");
	await page.getByRole("button", { name: "Créer mon compte" }).click();
	await expect(page.getByRole("heading", { name: "Vérifie ta boîte mail" })).toBeVisible();
	await expect(page.getByText(email)).toBeVisible();

	await page.goto("/login");
	await page.getByLabel("Adresse e-mail").fill(email);
	await page.locator("input[autocomplete=current-password]").fill("soleil2026");
	await page.getByRole("button", { name: "Se connecter" }).click();
	await expect(page.getByRole("alert")).toContainText("Confirme d'abord ton adresse e-mail");

	await page.goto(await emailLink(email, "confirme"));
	await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
	await expect(page.getByText("Aucune discussion pour l'instant")).toBeVisible();
});

test("un pseudo déjà pris est signalé", async ({ page }) => {
	const taken = await createUser("pris");
	await page.goto("/register");
	await page.getByLabel("Nom d'utilisateur").fill(taken.username);
	await expect(page.getByText("Déjà pris")).toBeVisible();
});

test("mauvais mot de passe : message clair, pas de connexion", async ({ page }) => {
	const user = await createUser("mdp");
	await page.goto("/login");
	await page.getByLabel("Adresse e-mail").fill(user.email);
	await page.locator("input[autocomplete=current-password]").fill("mauvais-mdp-1");
	await page.getByRole("button", { name: "Se connecter" }).click();
	await expect(page.getByRole("alert")).toHaveText("E-mail ou mot de passe incorrect.");
	await expect(page).toHaveURL(/\/login/);
});

test("connexion par lien magique", async ({ page }) => {
	const user = await createUser("magie");
	await page.goto("/login");
	await page.getByLabel("Adresse e-mail").fill(user.email);
	await page.getByRole("button", { name: "Recevoir un lien de connexion" }).click();
	await expect(page.getByRole("status").filter({ hasText: "Lien de connexion envoyé" })).toBeVisible();
	await page.goto(await emailLink(user.email, "lien de connexion"));
	await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
});

test("mot de passe oublié puis connexion avec le nouveau", async ({ page }) => {
	const user = await createUser("oubli");
	await page.goto("/login");
	await page.getByLabel("Adresse e-mail").fill(user.email);
	await page.getByRole("button", { name: "Oublié ?" }).click();
	await expect(page.getByRole("status").filter({ hasText: "réinitialisation" })).toBeVisible();

	await page.goto(await emailLink(user.email, "réinitialise"));
	await expect(page.getByRole("heading", { name: "Nouveau mot de passe" })).toBeVisible();
	await page.locator("input[autocomplete=new-password]").fill("nouveau2026");
	await page.getByRole("button", { name: "Enregistrer" }).click();
	await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();

	await page.goto("/settings");
	await page.getByRole("button", { name: "Se déconnecter" }).click();
	await login(page, { email: user.email, password: "nouveau2026" });
});

test("une page protégée renvoie à la connexion, puis revient où on était", async ({ page }) => {
	const user = await createUser("retour");
	await page.goto("/settings");
	await expect(page).toHaveURL(/\/login/);
	await page.getByLabel("Adresse e-mail").fill(user.email);
	await page.locator("input[autocomplete=current-password]").fill(user.password);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await expect(page).toHaveURL(/\/settings$/);
});
