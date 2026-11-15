import { execSync } from "node:child_process";
import { createECDH, randomBytes, type ECDH } from "node:crypto";
import { createServer, type Server } from "node:http";
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";
import { API_URL, createUser, newSession, openDirectChat, sendMessage, type TestUser } from "./helpers";

const ece = createRequire(import.meta.url)("http_ece") as {
	decrypt: (body: Buffer, params: { version: string; privateKey: ECDH; authSecret: Buffer }) => Buffer;
};

// Faux service de push, joignable depuis l'Edge Function (passerelle du réseau Docker de Supabase).
type Device = { key: ECDH; auth: Buffer; received: { title: string; body: string; roomId: number }[] };
const devices = new Map<string, Device>();
let server: Server;
let baseUrl: string;

test.beforeAll(async () => {
	const network = execSync("docker network ls --format '{{.Name}}'", { encoding: "utf8" })
		.split("\n")
		.find((n) => n.startsWith("supabase_network_"));
	const gateway = execSync(`docker network inspect ${network} -f '{{(index .IPAM.Config 0).Gateway}}'`, {
		encoding: "utf8",
	}).trim();
	server = createServer((req, res) => {
		const chunks: Buffer[] = [];
		req.on("data", (c: Buffer) => chunks.push(c));
		req.on("end", () => {
			const device = devices.get(req.url ?? "");
			if (!device || !String(req.headers.authorization).startsWith("vapid t=")) {
				res.writeHead(404).end();
				return;
			}
			const plain = ece.decrypt(Buffer.concat(chunks), {
				version: "aes128gcm",
				privateKey: device.key,
				authSecret: device.auth,
			});
			device.received.push(JSON.parse(plain.toString()) as Device["received"][number]);
			res.writeHead(201).end();
		});
	});
	await new Promise<void>((resolve) => server.listen(0, "0.0.0.0", resolve));
	baseUrl = `http://${gateway}:${(server.address() as { port: number }).port}`;
});

test.afterAll(() => server.close());

async function registerDevice(user: TestUser) {
	const key = createECDH("prime256v1");
	key.generateKeys();
	const device: Device = { key, auth: randomBytes(16), received: [] };
	const path = `/push/${user.username}`;
	devices.set(path, device);

	const token = (await (
		await fetch(`${API_URL}/auth/v1/token?grant_type=password`, {
			method: "POST",
			headers: { apikey: anonKey(), "Content-Type": "application/json" },
			body: JSON.stringify({ email: user.email, password: user.password }),
		})
	).json()) as { access_token: string };
	const res = await fetch(`${API_URL}/rest/v1/rpc/register_push_subscription`, {
		method: "POST",
		headers: { apikey: anonKey(), Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			p_endpoint: `${baseUrl}${path}`,
			p_p256dh: key.getPublicKey("base64url"),
			p_auth: device.auth.toString("base64url"),
		}),
	});
	expect(res.ok).toBe(true);
	return device;
}

let anon: string | undefined;
function anonKey() {
	anon ??= /^PUBLISHABLE_KEY="?([^"\n]+)"?/m.exec(execSync("npx supabase status -o env", { encoding: "utf8" }))?.[1];
	return anon!;
}

const openChatWith = async (page: Page, username: string) => {
	await page
		.getByRole("link", { name: new RegExp(username) })
		.first()
		.click();
};

test("un nouveau message déclenche une notification chiffrée, avec l'auteur et le texte", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const bobDevice = await registerDevice(bob);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	await sendMessage(a, "Tu es dispo ce soir ?");

	await expect.poll(() => bobDevice.received.length, { timeout: 15_000 }).toBe(1);
	expect(bobDevice.received[0]).toMatchObject({ title: alice.username, body: "Tu es dispo ce soir ?" });
});

test("pas de notification pour une conversation en sourdine, ni pour un message bloqué", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const aliceDevice = await registerDevice(alice);
	const bobDevice = await registerDevice(bob);
	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	await sendMessage(a, "Premier");
	await expect.poll(() => bobDevice.received.length, { timeout: 15_000 }).toBe(1);

	const b = await newSession(browser, bob);
	await openChatWith(b, alice.username);
	await b.getByRole("link", { name: "Profil du contact" }).click();
	await b.getByText("Couper les notifications").click();
	await expect(b.getByRole("checkbox", { name: "Couper les notifications" })).toBeChecked();
	await sendMessage(a, "En sourdine");

	await a.getByRole("link", { name: "Profil du contact" }).click();
	await a.getByRole("button", { name: `Bloquer ${bob.username}` }).click();
	await a.getByRole("button", { name: "Bloquer", exact: true }).click();
	await b.getByRole("link", { name: "Fermer" }).click();
	await sendMessage(b, "Message bloqué");

	await a.waitForTimeout(4_000);
	expect(bobDevice.received.map((n) => n.body)).toEqual(["Premier"]);
	expect(aliceDevice.received).toHaveLength(0);
});

test("aperçu désactivé : la notification ne montre pas le contenu", async ({ browser }) => {
	const [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
	const bobDevice = await registerDevice(bob);
	const b = await newSession(browser, bob);
	await b.goto("/settings");
	await b.getByText("Aperçu du message dans les notifications").click();
	await expect(b.getByRole("checkbox", { name: /Aperçu du message/ })).not.toBeChecked();

	const a = await newSession(browser, alice);
	await openDirectChat(a, bob.username);
	await sendMessage(a, "Code secret 1234");
	await expect.poll(() => bobDevice.received.length, { timeout: 15_000 }).toBe(1);
	expect(bobDevice.received[0]).toMatchObject({ title: alice.username, body: "Nouveau message" });
});
