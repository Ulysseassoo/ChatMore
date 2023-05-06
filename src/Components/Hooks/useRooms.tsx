import React from "react";
import useAuthStore from "../../Store/authStore";
import useRoomStore, { RoomState } from "../../Store/roomStore";
import { supabase } from "../../supabaseClient";
import { Profile } from "../../Interface/Types";
import { useToast } from "@chakra-ui/react";

const useRooms = () => {
	const session = useAuthStore((state) => state.session);
	const rooms = useRoomStore((state) => state.rooms);
	const addRoom = useRoomStore((state) => state.addRoom);
	const profile = useAuthStore((state) => state.profile);
	const toast = useToast();

	const sendRoomToUser = (room: RoomState) => {
		const channelHome = supabase.channel(`home${room.users[0].id}`, {
			config: {
				presence: { key: session?.user.id },
			},
		});

		channelHome.subscribe(async (status) => {
			// Subscribe to that room connection
			if (status === "SUBSCRIBED") {
				channelHome.send({
					type: "broadcast",

					event: "room",

					payload: { room: { ...room, users: [profile] } },
				});
			}
		});
	};

	const checkIfUserHasRoom = (newUserId: string) => {
		const check = rooms.filter((room) => room.users[0].id === newUserId);
		if (check.length === 0) return true;
		return false;
	};

	const createRoom = async (userId: string, user: Profile) => {
		// Create a room
		const { data: roomData, error: roomError }: { data: any; error: any } = await supabase
			.from("room")
			.insert({ created_at: new Date().toISOString() })
			.select()
			.single();
		if (roomError) throw roomError;
		const { id: roomId } = roomData;
		// Create ChatRoom between users
		const { error: chatUserRoomError }: { error: any } = await supabase
			.from("userHasRoom")
			.insert({ room: roomId, user: userId });
		if (chatUserRoomError) throw chatUserRoomError;
		const { error: userRoomError }: { error: any } = await supabase
			.from("userHasRoom")
			.insert({ room: roomId, user: session?.user.id });
		if (userRoomError) throw userRoomError;
		const newRoom: RoomState = {
			room: roomId,
			users: [user],
			messages: [],
			blockedUsers: [],
		};
		return newRoom;
	};

	const getUserRoom = async (username: string | undefined) => {
		// Get ID of User to add
		const { data: userData, error }: { data: any; error: any } = await supabase
			.from("profiles")
			.select("*")
			.eq("username", username)
			.single();
		if (error) throw Error;
		const { id: userId } = userData;
		// We need to check if that user doesn't already have a relation with the existing user
		if (!checkIfUserHasRoom(userId)) {
			const check = rooms.filter((room) => room.users[0].id === userId);
			return check[0];
		}
		const newRoom = await createRoom(userId, userData);
		addRoom(newRoom);
		sendRoomToUser(newRoom);
		toast({
			title: "Successfully added a user",
			description: "You will now be redirected to the chatroom.",
			status: "success",
			position: "top-right",
			duration: 3000,
			isClosable: true,
		});
		return newRoom;
	};

	return {
		getUserRoom,
	};
};

export default useRooms;
