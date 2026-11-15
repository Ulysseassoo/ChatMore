import { sendPush, type VapidKeys } from "./webpush.ts";

type Target = {
	subscription_id: number;
	endpoint: string;
	p256dh: string;
	auth: string;
	room_id: number;
	title: string;
	body: string;
};

const env = (name: string) => {
	const value = Deno.env.get(name);
	if (!value) throw new Error(`Variable manquante : ${name}`);
	return value;
};

async function rest(path: string, init: RequestInit = {}) {
	const key = env("SUPABASE_SERVICE_ROLE_KEY");
	const res = await fetch(`${env("SUPABASE_URL")}/rest/v1/${path}`, {
		...init,
		headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
	});
	if (!res.ok) throw new Error(`${path} : ${res.status} ${await res.text()}`);
	return res;
}

Deno.serve(async (req) => {
	if (req.method !== "POST" || req.headers.get("x-push-secret") !== env("PUSH_WEBHOOK_SECRET")) {
		return new Response("Forbidden", { status: 403 });
	}

	const { message_id } = (await req.json()) as { message_id?: number };
	if (!Number.isInteger(message_id)) return new Response("message_id manquant", { status: 400 });

	const vapid: VapidKeys = {
		publicKey: env("VAPID_PUBLIC_KEY"),
		privateKey: env("VAPID_PRIVATE_KEY"),
		subject: Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@chatmore.app",
	};

	const targets = (await (
		await rest("rpc/push_targets", { method: "POST", body: JSON.stringify({ p_message_id: message_id }) })
	).json()) as Target[];

	const expired: number[] = [];
	const results = await Promise.allSettled(
		targets.map(async (t) => {
			const res = await sendPush(t, { title: t.title, body: t.body, roomId: t.room_id, messageId: message_id }, vapid);
			// 404 / 410 : l'appareil s'est désabonné, on oublie l'abonnement.
			if (res.status === 404 || res.status === 410) expired.push(t.subscription_id);
			else if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
		}),
	);

	if (expired.length) await rest(`push_subscriptions?id=in.(${expired.join(",")})`, { method: "DELETE" });

	const failed = results.filter((r) => r.status === "rejected").length;
	if (failed) console.error(`send-push : ${failed} envoi(s) en échec`, results);
	return Response.json({ sent: targets.length - failed - expired.length, expired: expired.length, failed });
});
