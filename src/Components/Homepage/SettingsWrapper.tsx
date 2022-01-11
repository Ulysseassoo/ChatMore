import React, { ProfilerProps } from "react"
import styled, { css } from "styled-components"
import { ArrowBack } from "@styled-icons/boxicons-regular/ArrowBack"
import { useAppSelector } from "../../redux/hooks"
import { selectUser } from "../../redux/user/userSlice"
import { Edit2 } from "@styled-icons/feather/Edit2"
import Picture from "../../assets/profile.jpg"

type Props = {
	name: string
}

type FlexStyle = {
	flex: string
	profile?: boolean
}

type PictureProps = {
	avatarPicture: string
	defaultPicture: string
}

const SettingsWrapper = ({ name }: Props) => {
	const userSelector = useAppSelector(selectUser)
	return (
		<Container>
			<Item>
				<Label htmlFor={name}>
					<ArrowBack />
				</Label>
				<Title>{name}</Title>
			</Item>
			<ProfileInformations>
				<Flex flex="45%">
					<ImageBackground avatarPicture={userSelector.avatar_url} defaultPicture={Picture}></ImageBackground>
				</Flex>
				<Flex flex="55%" profile>
					<Header>
						<ImageContainer>
							<img src={userSelector.avatar_url !== null ? userSelector.avatar_url : Picture} alt="profile picture" />
						</ImageContainer>
						<Column>
							<ProfileName>
								{userSelector.username} <Edit2 />{" "}
							</ProfileName>
							<Status>Online</Status>
						</Column>
					</Header>
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
	${({ profile }) =>
		profile &&
		css`
			background: ${({ theme }) => theme.primaryColor};
			border-radius: 50px 50px 0 0;
			position: relative;
			top: -35px;
			box-shadow: rgba(0, 0, 0, 0.1) 0px -2px 1px 0px, rgba(0, 0, 0, 0.06) 0px -2px 1px 0px;
		`}
`

const ImageBackground = styled.div<PictureProps>`
	width: 100%;
	height: 100%;
	background: center no-repeat url(${({ avatarPicture, defaultPicture }) => (avatarPicture !== null ? avatarPicture : defaultPicture)});
	background-size: cover;
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
	}
`

const Status = styled.span`
	display: inline-block;
	font-weight: 600;
	font-size: 0.9rem;
	color: ${({ theme }) => theme.textColor};
`

export default SettingsWrapper
