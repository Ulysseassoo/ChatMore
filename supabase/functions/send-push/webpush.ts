// Web Push sans dépendance (WebCrypto) : chiffrement aes128gcm (RFC 8291) et VAPID (RFC 8292).
// Fonctionne dans Deno (Edge Functions) comme dans Node 20+.

export type PushSubscription = { endpoint: string; p256dh: string; auth: string };
export type VapidKeys = { publicKey: string; privateKey: string; subject: string };

const encoder = new TextEncoder();

export function base64UrlEncode(bytes: Uint8Array): string {
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(value: string): Uint8Array {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
	return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

const concat = (...parts: Uint8Array[]) => {
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let offset = 0;
	for (const p of parts) {
		out.set(p, offset);
		offset += p.length;
	}
	return out;
};

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number) {
	const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
	return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8));
}

function privateKeyJwk(publicKey: Uint8Array, privateKey: Uint8Array): JsonWebKey {
	return {
		kty: "EC",
		crv: "P-256",
		x: base64UrlEncode(publicKey.slice(1, 33)),
		y: base64UrlEncode(publicKey.slice(33, 65)),
		d: base64UrlEncode(privateKey),
		ext: true,
	};
}

export async function encryptPayload(subscription: PushSubscription, payload: Uint8Array, salt = crypto.getRandomValues(new Uint8Array(16))) {
	const uaPublic = base64UrlDecode(subscription.p256dh);
	const authSecret = base64UrlDecode(subscription.auth);

	const local = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])) as CryptoKeyPair;
	const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
	const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
	const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, local.privateKey, 256));

	const keyInfo = concat(encoder.encode("WebPush: info\0"), uaPublic, asPublic);
	const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);
	const cek = await hkdf(salt, ikm, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
	const nonce = await hkdf(salt, ikm, encoder.encode("Content-Encoding: nonce\0"), 12);

	const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
	const plaintext = concat(payload, new Uint8Array([2]));
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, plaintext));

	const recordSize = new Uint8Array(4);
	new DataView(recordSize.buffer).setUint32(0, 4096);
	return concat(salt, recordSize, new Uint8Array([asPublic.length]), asPublic, ciphertext);
}

export async function vapidAuthorization(endpoint: string, vapid: VapidKeys, now = Math.floor(Date.now() / 1000)) {
	const publicKey = base64UrlDecode(vapid.publicKey);
	const key = await crypto.subtle.importKey(
		"jwk",
		privateKeyJwk(publicKey, base64UrlDecode(vapid.privateKey)),
		{ name: "ECDSA", namedCurve: "P-256" },
		false,
		["sign"],
	);
	const header = base64UrlEncode(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
	const claims = base64UrlEncode(
		encoder.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: now + 12 * 3600, sub: vapid.subject })),
	);
	const signature = new Uint8Array(
		await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, encoder.encode(`${header}.${claims}`)),
	);
	return `vapid t=${header}.${claims}.${base64UrlEncode(signature)}, k=${vapid.publicKey}`;
}

export async function sendPush(subscription: PushSubscription, payload: unknown, vapid: VapidKeys, ttl = 86_400) {
	const body = await encryptPayload(subscription, encoder.encode(JSON.stringify(payload)));
	return fetch(subscription.endpoint, {
		method: "POST",
		headers: {
			Authorization: await vapidAuthorization(subscription.endpoint, vapid),
			"Content-Encoding": "aes128gcm",
			"Content-Type": "application/octet-stream",
			TTL: String(ttl),
			Urgency: "high",
		},
		body,
	});
}

export async function generateVapidKeys() {
	const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"])) as CryptoKeyPair;
	const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
	const publicKey = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
	return { publicKey: base64UrlEncode(publicKey), privateKey: jwk.d! };
}
