import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { readLocal, writeLocal } from "@/lib/storage";

type Preferences = {
	reduceMotion: boolean;
	largeText: boolean;
	setReduceMotion: (value: boolean) => void;
	setLargeText: (value: boolean) => void;
};

const apply = (reduceMotion: boolean, largeText: boolean) => {
	document.documentElement.dataset.reduceMotion = String(reduceMotion);
	document.documentElement.style.fontSize = largeText ? "112.5%" : "";
};

export const usePreferences = create<Preferences>((set, get) => ({
	reduceMotion: readLocal("cm.reduceMotion", false),
	largeText: readLocal("cm.largeText", false),
	setReduceMotion: (reduceMotion) => {
		writeLocal("cm.reduceMotion", reduceMotion || null);
		apply(reduceMotion, get().largeText);
		set({ reduceMotion });
	},
	setLargeText: (largeText) => {
		writeLocal("cm.largeText", largeText || null);
		apply(get().reduceMotion, largeText);
		set({ largeText });
	},
}));

export function applyStoredPreferences() {
	const { reduceMotion, largeText } = usePreferences.getState();
	apply(reduceMotion, largeText);
}

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
	const mq = window.matchMedia(query);
	mq.addEventListener("change", cb);
	return () => mq.removeEventListener("change", cb);
};

export function useReducedMotion(): boolean {
	const system = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
	const local = usePreferences((s) => s.reduceMotion);
	return system || local;
}
