import React, { ProfilerProps, useEffect, useState } from "react"
import styled, { css } from "styled-components"
import { ArrowBack } from "@styled-icons/boxicons-regular/ArrowBack"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { selectUser, updateProfileData } from "../../redux/user/userSlice"
import { Edit2 } from "@styled-icons/feather/Edit2"
import Picture from "../../assets/profile.jpg"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { supabase } from "../../supabaseClient"
import Button from "../Auth/Button"

type Props = {
	name: string
}

type FlexStyle = {
	flex: string
	$profile: boolean
}

type PictureProps = {
	avatarPicture: string
	defaultPicture: string
}

type FormData = {
	username: string
	about: string
	phone: string
}

type ImageFormData = {
	image: FileList
}

const SettingsWrapper = ({ name }: Props) => {
	const online = window.navigator.onLine
	const userSelector = useAppSelector(selectUser)
	const dispatch = useAppDispatch()
	const [editMode, setEditMode] = useState(false)

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting }
	} = useForm()
	const onSubmit = async (data: FormData) => {
		const { about, username, phone } = data
		const updates = {
			id: userSelector.id,
			username,
			about,
			phone,
			updated_at: new Date()
		}
		try {
			let { error, data: newData }: { error: any; data: any } = await supabase.from("profiles").upsert(updates, {
				returning: "representation" //
			})
			if (error) throw Error
			dispatch(updateProfileData(newData[0]))
			toast.success("Your informations has been updated !")
			setEditMode(false)
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	const { register: registerImage, handleSubmit: handleImageSubmit, reset } = useForm()
	const onSubmitImage = async (data: ImageFormData) => {
		const { image } = data
		const file = image[0]
		const fileExt = file.name.split(".").pop()
		const fileName = `${Math.random()}.${fileExt}`
		const filePath = `${fileName}`
		try {
			let { error: uploadError, data: imageData } = await supabase.storage.from("avatars").upload(filePath, file)

			if (uploadError) {
				throw uploadError
			}
			const avatar_url: any = imageData?.Key
			const { data: urlData, error: urlError }: { data: any; error: any } = await supabase.storage
				.from("avatars")
				.getPublicUrl(avatar_url.split("/")[1])
			if (urlError) throw Error
			const updates = {
				id: userSelector.id,
				avatar_url: urlData.publicURL,
				updated_at: new Date()
			}
			let { error: newError, data: newData }: { error: any; data: any } = await supabase.from("profiles").upsert(updates, {
				returning: "representation" //
			})
			if (newError) throw Error
			dispatch(updateProfileData(newData[0]))
			toast.success("Your profile picture has been updated !")
			reset({ image: image.length })
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	useEffect(() => {
		if (editMode) {
			setValue("username", userSelector.username)
			setValue("about", userSelector.about)
			setValue("phone", userSelector.phone)
		}
	}, [editMode])

	if (editMode) {
		return (
			<Container>
				<Item>
					<Label htmlFor={name}>
						<ArrowBack />
					</Label>
					<Title>{name}</Title>
				</Item>
				<ProfileInformations>
					<Flex flex="45%" $profile={false}>
						<ImageBackground avatarPicture={userSelector.avatar_url} defaultPicture={Picture}></ImageBackground>
					</Flex>
					<Form onSubmit={handleSubmit(onSubmit)}>
						<Flex flex="55%" $profile>
							<Header>
								<ImageContainer>
									<img src={userSelector.avatar_url !== null ? userSelector.avatar_url : Picture} alt="profile picture" />
								</ImageContainer>
								<Column>
									<ProfileName>
										<Input type="text" {...register("username", {})} />
									</ProfileName>
									<Status>{online ? "Online" : "Offline"}</Status>
								</Column>
							</Header>
							<About>
								<SubTitle>About me</SubTitle>
								<Text>
									<Input type="textarea" placeholder="Some facts about you..." {...register("about", {})} />
								</Text>
							</About>
							<Between>
								<SubTitle>Phone</SubTitle>
								<Text>
									<Input type="text" placeholder="Your phone number ?" {...register("phone", {})} />
								</Text>
							</Between>
						</Flex>
						<Submit>
							<Button type="submit" content="Update" isSubmitting={isSubmitting} />
						</Submit>
					</Form>
				</ProfileInformations>
			</Container>
		)
	}

	return (
		<Container>
			<Item>
				<Label htmlFor={name}>
					<ArrowBack />
				</Label>
				<Title>{name}</Title>
			</Item>
			<ProfileInformations>
				<Flex flex="45%" $profile={false}>
					<ImageBackground avatarPicture={userSelector.avatar_url} defaultPicture={Picture}></ImageBackground>
				</Flex>
				<Flex flex="55%" $profile>
					<Header>
						<ImageContainer>
							<ImageForm onChange={handleImageSubmit(onSubmitImage)}>
								<ImageInput type="file" {...registerImage("image", {})} />
								<ImageBackgroundInput avatarPicture={userSelector.avatar_url} defaultPicture={Picture} />
							</ImageForm>
						</ImageContainer>
						<Column>
							<ProfileName>
								{userSelector.username}
								<Edit2 onClick={() => setEditMode(true)} />
							</ProfileName>
							<Status>{online ? "Online" : "Offline"}</Status>
						</Column>
					</Header>
					<About>
						<SubTitle>About me</SubTitle>
						<Text>{userSelector.about}</Text>
					</About>
					<Between>
						<SubTitle>Phone</SubTitle>
						<Text>{userSelector.phone}</Text>
					</Between>
				</Flex>
			</ProfileInformations>
		</Container>
	)
}

const Container = styled.div`
	background-color: ${({ theme }) => theme.primaryColor};
	width: 450px;
	border-right: 1px solid ${({ theme }) => theme.lineBreakColor};
	display: flex;
	flex-direction: column;
	position: absolute;
	z-index: 5;
	height: 100%;
	right: 100%;
	transition: 0.3s ease;
	top: 0;
	@media screen and (max-width: 910px) {
		width: 100%;
	}
`

const Label = styled.label``

const Item = styled.div`
	width: 100%;
	padding: 1rem;
	display: flex;
	align-items: center;
	height: 80px;
	background-color: #403b38;
	gap: 1rem;
	& svg {
		color: ${({ theme }) => theme.white};
		width: 30px;
		height: 30px;
		cursor: pointer;
	}
`

const Title = styled.p`
	color: ${({ theme }) => theme.white};
	font-size: 1.3rem;
	display: contents;
`

const ProfileInformations = styled.div`
	height: calc(100% - 80px);
	display: flex;
	flex-direction: column;
`
const Flex = styled.div<FlexStyle>`
	flex: ${({ flex }) => flex};
	${({ $profile }) =>
		$profile &&
		css`
			background: ${({ theme }) => theme.primaryColor};
			border-radius: 50px 50px 0 0;
			position: relative;
			top: -35px;
			box-shadow: rgba(0, 0, 0, 0.1) 0px -2px 1px 0px, rgba(0, 0, 0, 0.06) 0px -2px 1px 0px;
			display: flex;
			flex-direction: column;
			gap: 3rem;
		`}
`

const Form = styled.form`
	background: ${({ theme }) => theme.primaryColor};
	border-radius: 50px 50px 0 0;
	position: relative;
	top: -35px;
	flex: 55%;
`

const ImageForm = styled.form`
	height: 100%;
	width: 100%;
	position: relative;
`

const Input = styled.input`
	border: none;
	border-bottom: 1px solid ${({ theme }) => theme.lineBreakColor};
	color: ${({ theme }) => theme.textColor};
	font-size: 0.8rem;
	background: none;
`

const Submit = styled.div`
	padding: 1rem;
`

const ImageBackground = styled.div<PictureProps>`
	width: 100%;
	height: 100%;
	background: center no-repeat url(${({ avatarPicture, defaultPicture }) => (avatarPicture !== null ? avatarPicture : defaultPicture)});
	background-size: cover;
`

const ImageBackgroundInput = styled.div<PictureProps>`
	height: 100%;
	width: 100%;
	background: center no-repeat url(${({ avatarPicture, defaultPicture }) => (avatarPicture !== null ? avatarPicture : defaultPicture)});
	background-size: cover;
	border: 3px solid ${({ theme }) => theme.secondaryColor};
	border-radius: 50%;
	transition: 0.4s ease-in;
	cursor: pointer;
	&:before {
		content: "Changez votre photo de profil ici";
		background-color: rgba(0, 0, 0, 0.322);
		font-weight: 600;
		border-radius: 50%;
		font-size: 0.55rem;
		display: flex;
		place-items: center;
		text-align: center;
		height: 100%;
		width: 100%;
		color: ${({ theme }) => theme.white};
	}
`

const ImageInput = styled.input`
	height: 100%;
	width: 100%;
	opacity: 0;
	cursor: pointer;
	position: absolute;
	inset: 0;
`

const Header = styled.div`
	display: flex;
	gap: 1.3rem;
	align-items: center;
	width: 100%;
	padding: 0 1.5rem;
`

const ImageContainer = styled.div`
	height: 100px;
	width: 100px;
	position: relative;
	top: -15px;
	& img {
		border: 3px solid ${({ theme }) => theme.secondaryColor};
		border-radius: 50%;
		height: 100%;
		width: 100%;
		object-fit: cover;
	}
`

const Column = styled.div`
	display: flex;
	flex-direction: column;
	align-items: start;
`

const ProfileName = styled.p`
	font-size: 1.3rem;
	color: ${({ theme }) => theme.white};
	display: inline-flex;
	gap: 0.8rem;
	align-items: center;
	position: relative;
	svg {
		height: 20px;
		width: 20px;
		position: relative;
		top: -5px;
		cursor: pointer;
	}
`

const Status = styled.span`
	display: inline-block;
	font-weight: 600;
	font-size: 0.9rem;
	color: ${({ theme }) => theme.textColor};
`

const About = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	align-items: start;
	padding: 0 1.5rem;
`

const SubTitle = styled.p`
	color: ${({ theme }) => theme.white};
	font-size: 1.1rem;
	font-weight: 600;
`

const Text = styled.p`
	color: ${({ theme }) => theme.textColor};
	font-size: 0.8rem;
`

const Between = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1.5rem;
`

export default SettingsWrapper
