import React, { useEffect } from "react"
import styled from "styled-components"
import { EmojiSmile } from "@styled-icons/bootstrap/EmojiSmile"
import { Send } from "@styled-icons/feather/Send"
import { useForm } from "react-hook-form"
import { useParams } from "react-router"
import { selectUser } from "../../redux/user/userSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { createImageMessage, createMessage } from "../../Services/APIs"
import { selectRooms, addMessageToRoom, updateImageMessage } from "../../redux/room/roomSlice"
import { toast } from "react-toastify"
import "emoji-mart/css/emoji-mart.css"
import { Picker } from "emoji-mart"
import { supabase } from "../../supabaseClient"
import { Image } from "@styled-icons/bootstrap/Image"

const SendMessage = () => {
	const userSelector = useAppSelector(selectUser)
	const chatRoom = useAppSelector(selectRooms)
	const dispatch = useAppDispatch()
	const params = useParams()

	const { id } = params
	type Message = {
		id?: number
		created_at: Date
		content: string
		room: number
		user: string
		view?: boolean
		images?: ImageToUse[]
	}

	type ImageToUse = {
		id?: number
		created_at: Date
		message_id: number
		message_room_id: number
		message_user_id: string
		url: string
	}

	const {
		register,
		handleSubmit,
		reset,
		getValues,
		setValue,
		formState: { errors }
	} = useForm()
	const { register: registerImage, handleSubmit: handleSubmitImage, reset: resetImage } = useForm()
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
			if (content === "") throw new Error("You need to write something :)")
			const message = await createMessage(newMessage)
			reset()
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	const onSubmitImage = async (data: any) => {
		const { image } = data
		const file = image[0]
		const fileExt = file.name.split(".").pop()
		const fileName = `${Math.random()}.${fileExt}`
		const filePath = `${fileName}`
		const IntId = parseInt(id!)
		const newMessage: Message = {
			created_at: new Date(),
			content: "",
			room: IntId,
			user: userSelector.id
		}
		try {
			if (fileExt !== "png") throw Error("You need to upload an Image(PNG)!")
			let { error: uploadError, data: imageData } = await supabase.storage.from("users-images").upload(filePath, file)
			if (uploadError) throw uploadError
			const message: Message[] = await createMessage(newMessage)
			const newImage: ImageToUse = {
				created_at: new Date(),
				message_id: message[0].id!,
				message_room_id: IntId,
				message_user_id: userSelector.id,
				url: imageData?.Key.split("/")[1]!
			}
			if (message[0].id) {
				const image = await createImageMessage(newImage)
			}
			resetImage()
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	const addEmoji = (e: any) => {
		let emoji = e.native
		let text = getValues("content")
		setValue("content", `${text}${emoji}`)
	}

	return (
		<Wrapper>
			<Form onChange={handleSubmitImage(onSubmitImage)}>
				<Input type="file" {...registerImage("image", {})} />
				<Image />
			</Form>
			<Container onSubmit={handleSubmit(onSubmit)}>
				<Input type="text" placeholder="Write your message here..." {...register("content", {})} />
				<Send />
				<Label htmlFor="emojis">
					<EmojiSmile />
				</Label>
			</Container>
			<Check id="emojis" type="checkbox" />
			<EmojiContainer>
				<Picker onSelect={addEmoji} sheetSize={16} title="" />
			</EmojiContainer>
		</Wrapper>
	)
}

const Wrapper = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	padding: 0 1rem;
	gap: 1rem;
`

const Form = styled.form`
	height: 100%;
	width: 50px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	& > svg {
		height: 30px;
		width: 30px;
		color: ${({ theme }) => theme.secondaryColor};
	}
	& input {
		opacity: 0;
		position: absolute;
		inset: 0;
		cursor: pointer;
		width: 100%;
		height: 100%;
	}
`

const Label = styled.label`
	height: 30px;
	width: 30px;
	position: absolute;
	top: 10px;
	right: 90px;
	cursor: pointer;

	& svg {
		color: ${({ theme }) => theme.secondaryColor};
	}
`

const Container = styled.form`
	height: 50px;
	width: calc(100% - 2rem);
	margin: 0.5rem;
	position: relative;
	& > svg {
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

const EmojiContainer = styled.div`
	position: absolute;
	top: -420px;
	right: 5px;
	z-index: 5;
	display: none;
`

const Check = styled.input`
	display: none;
	&:checked + ${EmojiContainer} {
		display: block;
	}
`
export default SendMessage
