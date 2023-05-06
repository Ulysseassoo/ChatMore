import { Profile } from "./../Interface/Types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

type State = {
	isLoggedIn: boolean;
	session: Session | null;
	profile: Profile | null;
};

type Actions = {
	setLoggedIn: (session: Session) => void;
	setLoggedOut: () => void;
	setProfile: (profile: Profile) => void;
};

const initialState: State = {
	session: null,
	isLoggedIn: false,
	profile: null,
};

const useAuthStore = create(
	immer<State & Actions>((set) => ({
		...initialState,
		setLoggedIn: async (session: Session) => {
			const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
			set((state) => {
				state.session = session;
				state.profile = data;
				state.isLoggedIn = true;
			});
		},
		setProfile: async (profile) =>
			set((state) => {
				state.profile = profile;
			}),
		setLoggedOut: () =>
			set((state) => {
				state.session = initialState.session;
				state.profile = initialState.profile;
				state.isLoggedIn = false;
			}),
	})),
);

export default useAuthStore;
