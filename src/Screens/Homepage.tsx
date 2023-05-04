import React, { useEffect } from "react";

import Header from "../Components/Homepage/Header";
import { Grid } from "@chakra-ui/react";
import Sidebar from "../Components/Sidebar";
import MainContent from "../Components/Homepage/MainContent";
import { supabase } from "../supabaseClient";
import useRoomStore from "../Store/roomStore";
import useOnlineStore from "../Store/onlineStore";
import useAuthStore from "../Store/authStore";

const Homepage: React.FC = () => {
	const session = useAuthStore((state) => state.session);
	const setOnlineUsers = useOnlineStore((state) => state.setOnlineUsers);
	const setRoomUsers = useOnlineStore((state) => state.setTypyingUsers);
	const rooms = useRoomStore((state) => state.rooms);
	const addMessageToRoom = useRoomStore((state) => state.addMessageToRoom);
	const addBlockedUser = useRoomStore((state) => state.addBlockedUser);
	const deleteBlockedUser = useRoomStore((state) => state.deleteBlockedUser);
	const updateViewRoomMessages = useRoomStore((state) => state.updateViewRoomMessages);
	const isLoading = useRoomStore((state) => state.isLoading);
	const addRoom = useRoomStore((state) => state.addRoom);
	const removeMessageFromRoom = useRoomStore((state) => state.removeMessageFromRoom);
	const channels = supabase.getChannels();

	const subscribeToHome = () => {
		const channelHome = supabase.channel(`home${session?.user.id}`, {
			config: {
				presence: { key: session?.user.id },
			},
		});

		channelHome
			.on("broadcast", { event: "room" }, (payload) => {
				addRoom(payload.payload.room);
			})
			.subscribe(async (status) => {
				if (status === "SUBSCRIBED") {
					// console.log(status);
				}
			});
	};

	const subscribeToRooms = () => {
		if (rooms.length > 0) {
			rooms.map((room) => {
				const isAlreadyInRealtime = !!channels.find((chann) => chann.topic.split(":")[1] === `room${room.room}`);
				if (!isAlreadyInRealtime) {
					const channel = supabase.channel(`room${room.room.toString()}`, {
						config: {
							presence: { key: session?.user.id },
						},
					});
					channel
						.on("broadcast", { event: "message" }, (payload) => {
							addMessageToRoom(payload.payload.message);
						})
						.on("broadcast", { event: "deleteMessage" }, (payload) => {
							removeMessageFromRoom(payload.payload.message);
						})
						.on("broadcast", { event: "deleteBlock" }, (payload) => {
							deleteBlockedUser(payload.payload.room_id, payload.payload.profile_id);
						})
						.on("broadcast", { event: "addBlock" }, (payload) => {
							addBlockedUser(payload.payload.userBlock);
						})
						.on("presence", { event: "sync" }, () => setRoomUsers({ ...channel.presenceState() }, room.room.toString()))
						.on("broadcast", { event: "readMessages" }, (payload) => {
							return updateViewRoomMessages(payload.payload.messages, session?.user.id);
						})
						.subscribe(async (status) => {
							if (status === "SUBSCRIBED") {
								// console.log(status, "to room", room.room);
							}
						});
				}
			});
		}
	};

	useEffect(() => {
		if (session !== null) {
			const channel = supabase.channel("online-users", {
				config: {
					presence: {
						key: session?.user.id,
					},
				},
			});

			// Set online users
			channel.on("presence", { event: "sync" }, () => {
				setOnlineUsers({ ...channel.presenceState() });
			});

			channel.subscribe(async (status) => {
				if (status === "SUBSCRIBED") {
					await channel.track({ online_at: new Date().toISOString() });
				}
			});
		}
	}, [session]);

	useEffect(() => {
		if (!isLoading) {
			subscribeToHome();
		}
	}, [isLoading]);

	useEffect(() => {
		if (!isLoading) {
			// Subscribe to rooms
			subscribeToRooms();
		}
	}, [isLoading, rooms]);

	return (
		<Grid
			as="main"
			height="100vh"
			background="rgba(43, 40, 38, 1)"
			gridTemplateColumns={"50px 1fr 1fr"}
			gridTemplateRows="50px 1fr 1fr"
			gridTemplateAreas={`
		"header header header"
		"sidebar chat chat"
		"sidebar chat chat"`}
		>
			<Header />
			<Sidebar />
			<MainContent />
		</Grid>
	);
};

export default Homepage;
