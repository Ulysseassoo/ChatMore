import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Session } from "@supabase/supabase-js";
import { Profile } from "../Interface/Types";

type State = {
	isContactResearchActive: boolean;
	isSettingsActive: boolean;
	contactProfiles: Profile[];
};

type Actions = {
	toggleContactResearch: () => void;
	setSettingsActive: (value: boolean) => void;
	setProfiles: (profiles: Profile[]) => void;
};

const initialState: State = {
	isContactResearchActive: false,
	isSettingsActive: false,
	contactProfiles: [],
};

const useSettingsStore = create(
	immer<State & Actions>((set) => ({
		...initialState,
		toggleContactResearch: () =>
			set((state) => {
				state.isContactResearchActive = !state.isContactResearchActive;
			}),
		setSettingsActive: (value: boolean) =>
			set((state) => {
				state.isSettingsActive = value;
			}),
		setProfiles: (profiles: Profile[]) =>
			set((state) => {
				state.contactProfiles = profiles;
			}),
	})),
);

export default useSettingsStore;
