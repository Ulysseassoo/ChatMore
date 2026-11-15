import { create } from "zustand";
import { readLocal, writeLocal } from "@/lib/storage";

type Drafts = { drafts: Record<number, string>; setDraft: (roomId: number, text: string) => void };

export const useDrafts = create<Drafts>((set) => ({
	drafts: readLocal<Record<number, string>>("cm.drafts", {}),
	setDraft: (roomId, text) =>
		set((s) => {
			const drafts = { ...s.drafts };
			if (text.trim()) drafts[roomId] = text;
			else delete drafts[roomId];
			writeLocal("cm.drafts", Object.keys(drafts).length ? drafts : null);
			return { drafts };
		}),
}));
