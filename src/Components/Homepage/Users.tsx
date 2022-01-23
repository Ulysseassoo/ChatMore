import styled from "styled-components"
import { useAppSelector } from "../../redux/hooks"
import { selectIsLoading, selectRooms } from "../../redux/room/roomSlice"
import User from "./User"

const Users = () => {
	const hasLoaded = useAppSelector(selectIsLoading)
	const chatRooms = useAppSelector(selectRooms)

	if (hasLoaded) {
		return <Container></Container>
	}
	return (
		<Container>
			{chatRooms.map((room) => {
				if (room.messages.length !== 0) {
					return (
						<User
							username={room.users[0].username}
							avatar_url={room.users[0].avatar_url}
							created_at={room.messages[0].created_at}
							room_id={room.room}
							key={room.room}
							view={room.messages[0].view!}
							message_user_id={room.messages[0].user}
							last_message={room.messages[0].content}
							images={room.messages[0].images}
							chat
						/>
					)
				}
			})}
		</Container>
	)
}

const Container = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
`

export default Users
