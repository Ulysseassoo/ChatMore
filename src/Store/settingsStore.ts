import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Session } from "@supabase/supabase-js";
import { Profile } from "../Interface/Types";

type State = {
	isContactResearchActive: boolean;
	isSettingsActive: boolean;
	contactProfiles: Profile[];
	isProfileActive: boolean;
};

type Actions = {
	toggleContactResearch: () => void;
	setSettingsActive: (value: boolean) => void;
	setIsProfileActive: (value: boolean) => void;
	setProfiles: (profiles: Profile[]) => void;
};

const initialState: State = {
	isContactResearchActive: false,
	isSettingsActive: false,
	isProfileActive: false,
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
		setIsProfileActive: (value: boolean) =>
			set((state) => {
				state.isProfileActive = value;
			}),
		setProfiles: (profiles: Profile[]) =>
			set((state) => {
				state.contactProfiles = profiles;
			}),
	})),
);

export default useSettingsStore;
