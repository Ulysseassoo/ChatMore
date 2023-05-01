import { Box, Flex, Heading, Icon, Input, Text } from "@chakra-ui/react";
import React from "react";
import { BsArrowLeft } from "react-icons/bs";
import { FiUser, FiUserX } from "react-icons/fi";
import useSettingsStore from "../../Store/settingsStore";
import SettingsWrapper from "./SettingsWrapper";
import SettingsWrapperPage from "./SettingsWrapperPage";
import { css } from "@emotion/react";
import ProfileSettings from "./ProfileSettings";

const data = [
	{
		Icon: FiUser,
		name: "Profile",
	},
	{
		Icon: FiUserX,
		name: "Bloqued Users",
	},
];

const SettingsHome = () => {
	const setSettingsActive = useSettingsStore((state) => state.setSettingsActive);

	return (
		<Flex
			flexDir="column"
			position="absolute"
			top="0"
			left="0"
			background="primaryColor"
			height="full"
			width="full"
			zIndex={2}
			w="30%"
			borderRight="1px solid"
			borderColor="lineBreakColor"
			overflow="hidden"
			css={{
				'& input[type="checkbox"]:checked + div': {
					right: "0%",
				},
			}}
		>
			<Box p="4" background="#403B38" display="inline-flex" className="settings-content" gap="4" alignItems="center">
				<Icon cursor={"pointer"} as={BsArrowLeft} boxSize={6} onClick={() => setSettingsActive(false)} />
				<Text fontSize="2xl">Settings</Text>
			</Box>
			{data.map((title) => {
				return (
					<Box
						display="flex"
						key={title.name}
						alignItems="center"
						borderBottom={"1px solid"}
						borderColor="lineBreakColor"
						_hover={{
							background: "lineBreakColor",
						}}
					>
						<Box w="full" cursor={"pointer"} p="4" display="inline-flex" gap="4" as="label" htmlFor={title.name}>
							<Icon as={title.Icon} boxSize={6} color="white" />
							<Text>{title.name}</Text>
						</Box>
						<input
							style={{
								display: "none",
							}}
							id={title.name}
							type="checkbox"
						/>
						<SettingsWrapperPage name={title.name}>
							<ProfileSettings />
						</SettingsWrapperPage>
					</Box>
				);
			})}
		</Flex>
	);
};

export default SettingsHome;
