/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

type PushPayload = { title: string; body: string; roomId: number };

void self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

// L'app s'ouvre même sans réseau (en développement, index.html n'est pas pré-caché).
if (manifest.some((entry) => (typeof entry === "string" ? entry : entry.url) === "index.html")) {
	registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
}

self.addEventListener("push", (event) => {
	const payload = event.data?.json() as PushPayload | undefined;
	if (!payload) return;
	event.waitUntil(
		(async () => {
			const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
			const reading = windows.some(
				(w) =>
					w.focused && w.visibilityState === "visible" && new URL(w.url).pathname.startsWith(`/chat/${payload.roomId}`),
			);
			if (reading) return;
			await self.registration.showNotification(payload.title, {
				body: payload.body,
				icon: "/icon-192.png",
				badge: "/icon-192.png",
				tag: `room-${payload.roomId}`,
				data: { url: `/chat/${payload.roomId}` },
			});
		})(),
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = (event.notification.data as { url?: string } | null)?.url ?? "/";
	event.waitUntil(
		(async () => {
			const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
			const existing = windows[0];
			if (existing) {
				await existing.focus();
				await existing.navigate(url);
			} else {
				await self.clients.openWindow(url);
			}
		})(),
	);
});
