import React, { useEffect, useState } from "react"
import styled, { css } from "styled-components"
import { useAppSelector } from "../../redux/hooks"
import { selectUser } from "../../redux/user/userSlice"
import { ArrowIosDownward } from "@styled-icons/evaicons-solid/ArrowIosDownward"
import { DeleteBin } from "@styled-icons/remix-line/DeleteBin"
import { deleteMessage } from "../../Services/APIs"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "react-toastify"
import { supabase } from "../../supabaseClient"

type Props = {
	id?: number
	created_at: Date
	content: string
	room: number
	user: string
	view?: boolean
	images: ImageToUse[]
}

type ImageToUse = {
	id?: number
	created_at: Date
	message_id: number
	message_room_id: number
	message_user_id: string
	url: string
}

type ContainerProps = {
	userID: string
	messageUserID: string
	view: boolean
	images?: ImageToUse[]
}

type IconStyling = {
	theme: any
	red?: boolean
}

const Message = ({ content, created_at, user, view, id, images }: Props) => {
	const userID = useAppSelector(selectUser).id
	const [activeDropdown, setActiveDropdown] = useState(false)
	const [imageSrc, setImageSrc] = React.useState("")

	const deleteMessageFromID = async (id: number) => {
		try {
			if (images.length > 0) throw new Error("You can't delete an image sent")
			const data = await deleteMessage(id)
			toast.success("Message deleted !")
			setActiveDropdown(false)
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	const variants = {
		visible: { height: "fit-content", opacity: 100 },
		hidden: { height: 0, opacity: 0 }
	}

	const animationMessage = {
		visible: { y: 0, opacity: 100 },
		hidden: { y: 50, opacity: 0 }
	}

	useEffect(() => {
		if (images?.length > 0) {
			getImageSource(images[0].url)
		}
	}, [images])

	const getImageSource = async (source: string) => {
		try {
			const { data, error } = await supabase.storage.from("users-images").download(source)
			if (error) {
				throw error
			}
			const url = URL.createObjectURL(data!)
			setImageSrc(url)
		} catch (error: any) {
			console.log("Error downloading image: ", error.message)
		}
	}

	return (
		<AnimatePresence>
			<Container
				userID={userID}
				messageUserID={user}
				view={view!}
				images={images}
				key={id}
				animate="visible"
				initial="hidden"
				transition={{ ease: "easeOut", duration: 0.3 }}
				variants={animationMessage}
				exit="hidden">
				{images?.length > 0 && <img src={imageSrc} alt="image" />}
				{content}
				<Time>
					{new Date(created_at).getHours()}:{new Date(created_at).getMinutes()}
				</Time>
				{userID === user && <ArrowIosDownward onClick={() => setActiveDropdown((prev) => !prev)} />}
				<AnimatePresence>
					{activeDropdown && (
						<Dropdown animate="visible" initial="hidden" transition={{ ease: "easeOut", duration: 0.2 }} variants={variants} exit="hidden">
							<Item red onClick={() => deleteMessageFromID(id!)}>
								<DeleteBin /> Delete
							</Item>
						</Dropdown>
					)}
				</AnimatePresence>
			</Container>
		</AnimatePresence>
	)
}

const Time = styled.span`
	color: ${({ theme }) => theme.secondaryColor};
	font-size: 0.7rem;
	margin-left: 1.4rem;
	display: inline-block;
`

const Container = styled(motion.div)<ContainerProps>`
	width: fit-content;
	background-color: ${({ userID, messageUserID, theme }) => (userID !== messageUserID ? theme.headerMenuColor : theme.accentColor)};
	color: ${({ theme }) => theme.white};
	box-shadow: 0 3px 6px rgba(64, 64, 64, 0.408);
	align-self: ${({ userID, messageUserID }) => (userID !== messageUserID ? "start" : "end")};
	padding: 0.25rem 1rem;
	border-radius: 10px;
	position: relative;
	z-index: 2;
	${({ images }) =>
		images?.length! > 0 &&
		css`
			display: flex;
			flex-direction: column;
			align-items: right;
			gap: 0.5rem;
			& ${Time} {
				text-align: right;
			}
		`}
	&:hover:before {
		opacity: 100;
		bottom: -20px;
	}
	&:before {
		content: ${({ view, userID, messageUserID }) => (userID !== messageUserID ? "" : view ? "'Seen'" : "'Sent'")};
		font-size: 0.7rem;
		position: absolute;
		bottom: 0px;
		right: ${({ userID, messageUserID }) => (userID !== messageUserID ? "initial" : "10px")};
		left: ${({ userID, messageUserID }) => (userID !== messageUserID ? "10px" : "initial")};
		color: ${({ view, theme }) => (view ? theme.viewColor : theme.white)};
		transition: 0.3s ease;
		opacity: 0;
	}
	&:hover {
		& > svg {
			opacity: 100;
		}
	}
	& > svg {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		position: absolute;
		top: 0;
		right: 10px;
		opacity: 0;
		transition: 0.1s ease;
		cursor: pointer;
		background-color: ${({ theme }) => theme.accentColor};
	}
`

const Dropdown = styled(motion.div)`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	flex-direction: column;
	border: 1px solid ${({ theme }) => theme.textColor};
	border-radius: 5px;
	background-color: ${({ theme }) => theme.headerMenuColor};
	height: 40px;
	width: 150px;
	top: 18px;
	right: 10px;
	z-index: 10;
	padding: 0.2rem;
	overflow: hidden;
`

const Item = styled.div<IconStyling>`
	font-size: 0.8rem;
	display: flex;
	padding: 0.2rem 1rem;
	align-items: center;
	gap: 0.5rem;
	width: 100%;
	color: ${({ red, theme }) => (red ? theme.importantColor : theme.white)};
	transition: 0.3s ease-in;
	cursor: pointer;
	& svg {
		height: 100%;
		width: 20px;
	}
	${({ red }) =>
		red &&
		css`
			& svg {
				color: ${({ theme }) => theme.importantColor};
			}
		`}
	&:hover {
		background-color: ${({ theme }) => theme.lineBreakColor};
	}
`

export default Message
