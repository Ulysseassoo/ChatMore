import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styled from "styled-components"
import { useAppSelector } from "../../redux/hooks"
import { selectUser } from "../../redux/user/userSlice"
import { supabase } from "../../supabaseClient"

type Props = {
	setActiveModal: React.Dispatch<React.SetStateAction<boolean>>
}

type FormData = {
	username: string
}

const Modal = ({ setActiveModal }: Props) => {
	const userSelector = useAppSelector(selectUser)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm()
	const onSubmit = async (data: FormData) => {
		try {
			// Get ID of User to add
			const { data: userData, error }: { data: any; error: any } = await supabase.from("profiles").select("id").eq("username", data.username)
			if (error) throw Error
			const { id: userId } = userData[0]
			// We need to check if that user doesn't already have a relation with the existing user
			// Create a room
			const { data: roomData, error: roomError }: { data: any; error: any } = await supabase.from("room").insert({ created_at: new Date() })
			if (roomError) throw Error
			const { id: roomId } = roomData[0]
			// Create ChatRoom between users
			const { data: chatUserRoomData, error: chatUserRoomError }: { data: any; error: any } = await supabase
				.from("userHasRoom")
				.insert({ room: roomId, user: userId })
			if (chatUserRoomError) throw Error
			const { data: userRoomData, error: userRoomError }: { data: any; error: any } = await supabase
				.from("userHasRoom")
				.insert({ room: roomId, user: userSelector.id })
			if (userRoomError) throw Error
			toast.success(`You can now chat with ${data.username}`)
			setActiveModal(false)
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	return (
		<Container>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Title>Add a new User (username)</Title>
				<Input type="text" autoFocus placeholder="username" {...register("username", {})} />
			</Form>
		</Container>
	)
}

const Container = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	flex-direction: column;
	border: 1px solid ${({ theme }) => theme.lineBreakColor};
	border-radius: 0 0 5px 5px;
	background-color: ${({ theme }) => theme.headerMenuColor};
	height: 100px;
	width: 100%;
	top: 81px;
	right: 0;
	z-index: 10;
`

const Title = styled.p`
	color: ${({ theme }) => theme.white};
`

const Form = styled.form`
	display: flex;
	width: 100%;
	padding: 0.5rem;
	flex-direction: column;
	gap: 0.25rem;
`

const Input = styled.input`
	width: 100%;
	padding: 0.2rem;
	border-radius: 0.5rem;
	border: 1px solid ${({ theme }) => theme.secondaryColor};
	background-color: ${({ theme }) => theme.textColor};
	color: ${({ theme }) => theme.white};
	transition: 0.3s ease;
	&:focus {
		outline: 1px solid ${({ theme }) => theme.accentColor};
	}
`

export default Modal
