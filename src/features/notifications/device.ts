import { useCallback, useEffect, useState } from "react";
import { registerSubscription, removeSubscription } from "./api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const pushSupported = () =>
	!!VAPID_PUBLIC_KEY && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const fromBase64Url = (value: string) => {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
	return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

async function registration(timeout = 8_000) {
	return Promise.race([
		navigator.serviceWorker.ready,
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Service worker indisponible")), timeout)),
	]);
}

export async function currentSubscription(timeout?: number) {
	if (!pushSupported()) return null;
	return (await registration(timeout)).pushManager.getSubscription();
}

export async function enablePush() {
	if ((await Notification.requestPermission()) !== "granted") return false;
	const subscription = await (
		await registration()
	).pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromBase64Url(VAPID_PUBLIC_KEY!) });
	const { endpoint, keys } = subscription.toJSON();
	await registerSubscription(endpoint!, keys!.p256dh!, keys!.auth!);
	return true;
}

// À la déconnexion aussi : un autre compte sur cet appareil ne doit pas recevoir nos notifications.
export async function disablePush() {
	const subscription = await currentSubscription(2_000).catch(() => null);
	if (!subscription) return;
	await removeSubscription(subscription.endpoint).catch(() => undefined);
	await subscription.unsubscribe();
}

export function useDevicePush() {
	const supported = pushSupported();
	const [enabled, setEnabled] = useState(false);
	const [busy, setBusy] = useState(false);
	const [denied, setDenied] = useState(supported && Notification.permission === "denied");

	useEffect(() => {
		if (!supported) return;
		void currentSubscription()
			.then((s) => setEnabled(!!s))
			.catch(() => setEnabled(false));
	}, [supported]);

	const toggle = useCallback(async (on: boolean) => {
		setBusy(true);
		try {
			if (on) {
				const granted = await enablePush();
				setDenied(!granted && Notification.permission === "denied");
				setEnabled(granted);
			} else {
				await disablePush();
				setEnabled(false);
			}
		} finally {
			setBusy(false);
		}
	}, []);

	return { supported, enabled, busy, denied, toggle };
}
