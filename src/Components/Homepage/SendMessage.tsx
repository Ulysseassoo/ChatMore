import React from "react"
import styled from "styled-components"
import { EmojiSmile } from "@styled-icons/bootstrap/EmojiSmile"
import { Send } from "@styled-icons/feather/Send"
import { useForm } from "react-hook-form"
import { useParams } from "react-router"
import { selectUser } from "../../redux/user/userSlice"
import { useAppSelector } from "../../redux/hooks"
import { createMessage } from "../../Services/APIs"
import { toast } from "react-toastify"

const SendMessage = () => {
	const userSelector = useAppSelector(selectUser)
	const params = useParams()

	const { id } = params
	type Message = {
		id?: number
		created_at: Date
		content: string
		room: number
		user: string
		view?: boolean
	}

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm()
	const onSubmit = async (data: any) => {
		const { content } = data
		const IntId = parseInt(id!)
		const newMessage: Message = {
			created_at: new Date(),
			content,
			room: IntId,
			user: userSelector.id
		}
		try {
			const message = await createMessage(newMessage)
			reset()
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	return (
		<Container onSubmit={handleSubmit(onSubmit)}>
			<Input type="text" placeholder="Write your message here..." {...register("content", {})} />
			<Send />
			<EmojiSmile />
		</Container>
	)
}

const Container = styled.form`
	height: 50px;
	width: calc(100% - 2rem);
	margin: 0.5rem;
	position: relative;
	& svg {
		position: absolute;
		top: 10px;
		right: 90px;
		height: 30px;
		width: 30px;
		color: ${({ theme }) => theme.secondaryColor};
		cursor: pointer;
		&:nth-child(2) {
			right: 35px;
			background-color: ${({ theme }) => theme.accentColor};
			border-radius: 50%;
			padding: 0.2rem;
		}
	}
`

const Input = styled.input`
	border-radius: 1.5rem;
	width: 100%;
	height: 100%;
	background-color: ${({ theme }) => theme.headerMenuColor};
	border: 1px solid ${({ theme }) => theme.lineBreakColor};
	padding: 0 8rem 0 1rem;
	font-size: 1.1rem;
	color: ${({ theme }) => theme.secondaryColor};
	font-family: "Hind Guntur", sans-serif;
`

export default SendMessage
