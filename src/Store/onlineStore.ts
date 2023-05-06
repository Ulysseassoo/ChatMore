import { RealtimePresenceState } from "@supabase/supabase-js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface RoomRealtime {
	[key: string]: RealtimePresenceState;
}

type State = {
	onlineUsers: RealtimePresenceState;
	typyingUsersRooms: RoomRealtime;
};

type Actions = {
	setOnlineUsers: (users: RealtimePresenceState) => void;
	setTypyingUsers: (users: RealtimePresenceState, roomId: string | undefined) => void;
};

const initialState: State = {
	onlineUsers: {},
	typyingUsersRooms: {},
};

const useOnlineStore = create(
	immer<State & Actions>((set) => ({
		...initialState,
		setOnlineUsers: (users) =>
			set((state) => {
				state.onlineUsers = users;
			}),
		setTypyingUsers: (users, roomId) => {
			if (roomId !== undefined) {
				set((state) => {
					state.typyingUsersRooms = {
						[roomId]: users,
					};
				});
			}
		},
	})),
);

export default useOnlineStore;
