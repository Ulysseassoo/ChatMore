import React, { useEffect, useState } from "react";
import useOnlineStore from "../../Store/onlineStore";
import useRoomStore from "../../Store/roomStore";

const useUserIsTypying = (roomId: number | undefined) => {
	const [userIsTypying, setUserIsTypying] = useState(false);
	const roomUsers = useOnlineStore((state) => state.typyingUsersRooms);
	const rooms = useRoomStore((state) => state.rooms);
	const actualRoom = rooms.find((roomState) => roomState.room === roomId);
	const userToChat = actualRoom?.users[0];

	const isUserTypying = () => {
		if (actualRoom !== undefined) {
			const roomRealtime = roomUsers[actualRoom.room];
			if (roomRealtime !== undefined) {
				if (userToChat !== undefined) {
					const isUserExisting = Object.keys(roomRealtime).find((id) => id === userToChat.id);
					if (isUserExisting) {
						setUserIsTypying(true);
						return;
					}
				}
			}
		}
		return setUserIsTypying(false);
	};

	useEffect(() => {
		isUserTypying();
	}, [actualRoom, roomUsers]);

	return userIsTypying;
};

export default useUserIsTypying;
