import { expect, test } from "@playwright/test";
import { createUser } from "./helpers";

// Le Chromium headless allégé refuse toujours la permission de notifier : on prend le complet.
test.use({ channel: "chromium" });

test("le service worker affiche la notification reçue", async ({ browser }) => {
	const user = await createUser("sw");
	const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
	await context.grantPermissions(["notifications"], { origin: "http://localhost:5173" });
	const page = await context.newPage();
	const cdp = await context.newCDPSession(page);
	const registrations: { registrationId: string; scopeURL: string }[] = [];
	cdp.on("ServiceWorker.workerRegistrationUpdated", (e) => registrations.push(...e.registrations));
	await cdp.send("ServiceWorker.enable");

	await page.goto("/login");
	await page.evaluate(() => navigator.serviceWorker.ready);
	await expect.poll(() => registrations.length).toBeGreaterThan(0);

	await cdp.send("ServiceWorker.deliverPushMessage", {
		origin: "http://localhost:5173",
		registrationId: registrations[0]!.registrationId,
		data: JSON.stringify({ title: user.username, body: "Coucou depuis le push", roomId: 42 }),
	});

	await expect
		.poll(() =>
			page.evaluate(async () =>
				(await (await navigator.serviceWorker.ready).getNotifications()).map(
					(n) => `${n.title} | ${n.body} | ${n.tag}`,
				),
			),
		)
		.toEqual([`${user.username} | Coucou depuis le push | room-42`]);
	await context.close();
});
