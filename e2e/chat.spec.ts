import { expect, test, type Page } from "@playwright/test";
import { createUser, messageLog, newSession, openDirectChat, sendMessage } from "./helpers";

const PNG_1PX = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
	"base64",
);

const bubble = (page: Page, text: string) => messageLog(page).locator(`span:text-is(${JSON.stringify(text)})`);

async function openActions(page: Page, text: string) {
	await bubble(page, text).click({ button: "right" });
	return page.getByRole("menu");
}

test("conversation privée : temps réel, « écrit… » et accusé de lecture", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	const b = await newSession(browser, bob);

	await openDirectChat(a, bob.username);
	await sendMessage(a, "Salut Bob !");
	await expect(bubble(a, "Salut Bob !")).toBeVisible();

	const room = b.getByRole("link", { name: new RegExp(alice.username) });
	await expect(room, "la nouvelle conversation apparaît sans recharger").toBeVisible();
	await room.click();
	await expect(bubble(b, "Salut Bob !")).toBeVisible();

	await expect(a.getByLabel("Lu").last(), "Alice voit que Bob a lu").toBeVisible();

	await b.getByLabel("Message", { exact: true }).pressSequentially("Hello", { delay: 30 });
	await expect(a.getByRole("banner").getByText("écrit…")).toBeVisible();
	await b.getByRole("button", { name: "Envoyer" }).click();
	await expect(bubble(a, "Hello")).toBeVisible();
});

test("réponse, réaction, modification et suppression pour tous", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	const b = await newSession(browser, bob);

	await openDirectChat(a, bob.username);
	await sendMessage(a, "On se voit à 18h ?");
	await b.getByRole("link", { name: new RegExp(alice.username) }).click();

	await (await openActions(b, "On se voit à 18h ?")).getByRole("menuitem", { name: "Répondre" }).click();
	await expect(b.getByText(`Réponse à ${alice.username}`)).toBeVisible();
	await sendMessage(b, "Parfait !");
	await expect(messageLog(a).getByText("On se voit à 18h ?")).toHaveCount(2);

	await (await openActions(a, "Parfait !")).getByRole("button", { name: "Réagir avec 👍" }).click();
	await expect(messageLog(b).getByRole("button", { name: "👍 1" })).toBeVisible();

	await (await openActions(a, "On se voit à 18h ?")).getByRole("menuitem", { name: "Modifier" }).click();
	await a.getByLabel("Message", { exact: true }).fill("On se voit à 19h ?");
	await a.getByRole("button", { name: "Enregistrer la modification" }).click();
	await expect(bubble(b, "On se voit à 19h ?")).toBeVisible();
	await expect(messageLog(b).getByText(/modifié/)).toBeVisible();

	await (await openActions(a, "On se voit à 19h ?")).getByRole("menuitem", { name: "Supprimer pour tous" }).click();
	await a.getByRole("button", { name: "Supprimer", exact: true }).click();
	await expect(messageLog(b).getByText("Ce message a été supprimé")).toBeVisible();
});

test("envoi d'une image, reçue par l'autre via une URL signée", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	const b = await newSession(browser, bob);
	await b.getByRole("link", { name: new RegExp(alice.username) }).click();

	await a.locator("input[type=file]").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG_1PX });
	await expect(a.getByAltText("Photo envoyée")).toBeVisible();
	const received = b.getByAltText("Photo envoyée");
	await expect(received).toBeVisible();
	await expect(received).toHaveAttribute("src", /\/object\/sign\/attachments\//);
});

test("blocage silencieux : le bloqué écrit, rien n'arrive, aucun « lu »", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	await sendMessage(a, "Premier message");
	const b = await newSession(browser, bob);
	await b.getByRole("link", { name: new RegExp(alice.username) }).click();
	await expect(bubble(b, "Premier message")).toBeVisible();

	await a.getByRole("link", { name: "Profil du contact" }).click();
	await a.getByRole("button", { name: `Bloquer ${bob.username}` }).click();
	await a.getByRole("button", { name: "Bloquer", exact: true }).click();
	await expect(a.getByText(`Tu as bloqué ${bob.username}`)).toBeVisible();
	await expect(a.getByLabel("Message", { exact: true })).toHaveCount(0);

	await sendMessage(b, "Tu es là ?");
	await expect(bubble(b, "Tu es là ?")).toBeVisible();
	await expect(b.getByText("Non envoyé"), "le bloqué ne remarque rien").toHaveCount(0);

	await a.reload();
	await expect(bubble(a, "Premier message")).toBeVisible();
	await expect(bubble(a, "Tu es là ?")).toHaveCount(0);

	await b.reload();
	const blocked = bubble(b, "Tu es là ?").locator("xpath=..");
	await expect(blocked.getByLabel("Envoyé")).toBeVisible();
	await expect(blocked.getByLabel("Lu")).toHaveCount(0);
});

test("groupe : les membres reçoivent les messages avec le nom de l'auteur", async ({ browser }) => {
	const [alice, bob, carol] = await Promise.all([createUser("alice"), createUser("bob"), createUser("carol")]);
	const a = await newSession(browser, alice);

	await a.goto("/new/group");
	await a.getByLabel("Nom du groupe").fill("Projet E2E");
	for (const member of [bob, carol]) {
		await a.getByLabel("Ajouter des membres").fill(member.username);
		await a.getByText(`@${member.username}`).click();
	}
	await a.getByRole("button", { name: "Créer le groupe" }).click();
	await expect(a).toHaveURL(/\/chat\/\d+$/);
	await sendMessage(a, "Bienvenue à tous");

	for (const member of [bob, carol]) {
		const page = await newSession(browser, member);
		await page.getByRole("link", { name: /Projet E2E/ }).click();
		await expect(bubble(page, "Bienvenue à tous")).toBeVisible();
		await expect(messageLog(page).getByText(alice.username, { exact: true })).toBeVisible();
	}
});
