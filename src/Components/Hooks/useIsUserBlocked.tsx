import React from "react";
import useRoomStore from "../../Store/roomStore";
import useAuthStore from "../../Store/authStore";

const useIsUserBlocked = (roomId: number | undefined) => {
	const rooms = useRoomStore((state) => state.rooms);
	const actualRoom = rooms.find((room) => room.room === roomId);
	const profile = useAuthStore((state) => state.profile);

	const isRoomBlocked = !!actualRoom?.blockedUsers.find((room) => room.room_id === roomId);
	const hasConnectedUserBlockedRoom = !!actualRoom?.blockedUsers.find(
		(room) => room.room_id === roomId && room.blocking_user_id === profile?.id,
	);

	return {
		isRoomBlocked,
		hasConnectedUserBlockedRoom,
	};
};

export default useIsUserBlocked;
