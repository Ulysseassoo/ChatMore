import { expect, test, type Page } from "@playwright/test";
import { adminRest, createUser, messageLog, newSession, openDirectChat, roomIdFromUrl, sendMessage } from "./helpers";

const PNG_1PX = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
	"base64",
);

const bubble = (page: Page, text: string) => messageLog(page).locator(`span:text-is(${JSON.stringify(text)})`);

test("recherche dans la conversation et saut vers un message ancien", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	const roomId = roomIdFromUrl(a);

	const start = Date.now() - 3 * 86_400_000;
	const history = Array.from({ length: 80 }, (_, i) => ({
		room_id: roomId,
		user_id: i % 2 ? alice.id : bob.id,
		content: i === 3 ? "Le code du portail est 4521, retiens-le" : `Message d'historique n°${i}`,
		created_at: new Date(start + i * 60_000).toISOString(),
	}));
	await adminRest(`/rest/v1/room_members?room_id=eq.${roomId}`, {
		method: "PATCH",
		body: { joined_at: new Date(start - 86_400_000).toISOString() },
	});
	await adminRest("/rest/v1/messages", { method: "POST", body: history });
	await a.reload();
	await expect(bubble(a, "Message d'historique n°79")).toBeVisible();
	await expect(bubble(a, "Le code du portail est 4521, retiens-le")).toHaveCount(0);

	await a.getByRole("link", { name: "Rechercher dans la conversation" }).click();
	await a.getByLabel("Texte à rechercher").fill("PORTAIL");
	await expect(a.getByText("1 résultat")).toBeVisible();
	await a.getByRole("button", { name: /Le code du portail/ }).click();

	const target = bubble(a, "Le code du portail est 4521, retiens-le");
	await expect(target, "le message ancien est chargé et centré").toBeInViewport();
});

test("transférer un message à une autre discussion", async ({ browser }) => {
	const [alice, bob, carol] = await Promise.all([createUser("alice"), createUser("bob"), createUser("carol")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, carol.username);
	await openDirectChat(a, bob.username);
	await sendMessage(a, "Adresse : 12 rue Oberkampf");

	await bubble(a, "Adresse : 12 rue Oberkampf").click({ button: "right" });
	await a.getByRole("menuitem", { name: "Transférer" }).click();
	await a.getByRole("dialog").getByText(carol.username).click();
	await a.getByRole("button", { name: "Transférer (1)" }).click();
	await expect(a.getByText("Transféré à 1 discussion")).toBeVisible();

	const c = await newSession(browser, carol);
	await c.getByRole("link", { name: new RegExp(alice.username) }).click();
	await expect(bubble(c, "Adresse : 12 rue Oberkampf")).toBeVisible();
	await expect(messageLog(c).getByText("Transféré")).toBeVisible();
});

test("l'admin renomme le groupe et change sa photo, les membres le voient en direct", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await a.goto("/new/group");
	await a.getByLabel("Nom du groupe").fill("Avant");
	await a.getByLabel("Ajouter des membres").fill(bob.username);
	await a.getByText(`@${bob.username}`).click();
	await a.getByRole("button", { name: "Créer le groupe" }).click();
	await expect(a).toHaveURL(/\/chat\/\d+$/);

	const b = await newSession(browser, bob);
	await expect(b.getByRole("link", { name: /Avant/ })).toBeVisible();

	await a.getByRole("link", { name: "Infos du groupe" }).click();
	await a.getByRole("button", { name: "Renommer le groupe" }).click();
	await a.getByLabel("Nom du groupe").fill("Après");
	await a.getByRole("button", { name: "OK" }).click();
	await expect(b.getByRole("link", { name: /Après/ }), "renommage reçu sans recharger").toBeVisible();

	await a
		.locator('input[type=file][accept="image/jpeg,image/png,image/webp"]')
		.setInputFiles({ name: "g.png", mimeType: "image/png", buffer: PNG_1PX });
	await expect(b.getByRole("link", { name: /Après/ }).locator("img")).toHaveAttribute("src", /\/avatars\/room-\d+\//);
});

test("supprimer pour tous une image efface aussi le fichier", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	const roomId = roomIdFromUrl(a);

	await a.locator("input[type=file]").setInputFiles({ name: "p.png", mimeType: "image/png", buffer: PNG_1PX });
	await expect(a.getByAltText("Photo envoyée")).toHaveAttribute("src", /\/object\/sign\//);
	const files = () =>
		adminRest("/storage/v1/object/list/attachments", { method: "POST", body: { prefix: `${roomId}/` } });
	await expect.poll(async () => ((await files()) as unknown[]).length).toBe(1);

	await a.getByAltText("Photo envoyée").click({ button: "right" });
	await a.getByRole("menuitem", { name: "Supprimer pour tous" }).click();
	await a.getByRole("button", { name: "Supprimer", exact: true }).click();
	await expect(messageLog(a).getByText("Ce message a été supprimé")).toBeVisible();
	await expect
		.poll(async () => ((await files()) as unknown[]).length, { message: "fichier retiré du Storage" })
		.toBe(0);
});
