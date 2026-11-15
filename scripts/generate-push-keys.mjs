// Génère une paire de clés VAPID pour le développement local :
// supabase/.env (clé privée, lue par l'Edge Function) et .env.local (clé publique, lue par le front).
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const toB64Url = (bytes) => Buffer.from(bytes).toString("base64url");
const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
const publicKey = toB64Url(new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey)));
const privateKey = (await crypto.subtle.exportKey("jwk", pair.privateKey)).d;

function upsert(file, values) {
	const lines = existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean) : [];
	const kept = lines.filter((l) => !Object.keys(values).some((k) => l.startsWith(`${k}=`)));
	writeFileSync(file, [...kept, ...Object.entries(values).map(([k, v]) => `${k}=${v}`)].join("\n") + "\n");
}

upsert("supabase/.env", { VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: privateKey });
upsert(".env.local", { VITE_VAPID_PUBLIC_KEY: publicKey });
console.log("Clés VAPID écrites dans supabase/.env et .env.local. Relance `yarn db:start` pour les charger.");
