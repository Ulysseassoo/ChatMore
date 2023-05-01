import { Avatar, Center, Flex, Icon } from "@chakra-ui/react";
import { BsChatDots } from "react-icons/bs";
import { BiCog } from "react-icons/bi";
import useAuthStore from "../../Store/authStore";
import useSettingsStore from "../../Store/settingsStore";

const Sidebar = () => {
	const profile = useAuthStore((state) => state.profile);
	const setSettingsActive = useSettingsStore((state) => state.setSettingsActive);
	const isSettingsActive = useSettingsStore((state) => state.isSettingsActive);

	return (
		<Flex
			alignItems="center"
			flexDir="column"
			justifyContent={"space-between"}
			boxShadow="rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;"
			background="rgba(43, 40, 38, 1)"
			gridArea={"sidebar"}
			pb="4"
		>
			<Flex gap="4" pt="2" flexDir="column" w="full" px="0.5">
				<Center
					w="full"
					position="relative"
					h="8"
					background={!isSettingsActive ? "#35312E" : "transparent"}
					p="1"
					borderRadius={"lg"}
					overflow="hidden"
					cursor="pointer"
					onClick={() => setSettingsActive(false)}
					_before={{
						content: !isSettingsActive ? `""` : "initial",
						background: "accentColor",
						height: "full",
						width: "3px",
						position: "absolute",
						borderRadius: "lg",
						left: 0.5,
						top: 0,
					}}
				>
					<Icon color="white" as={BsChatDots} boxSize={4} />
				</Center>
			</Flex>

			<Flex gap="4" flexDir="column" alignItems="center" w="full">
				<Center
					w="full"
					position="relative"
					h="8"
					background={isSettingsActive ? "#35312E" : "transparent"}
					p="1"
					borderRadius={"lg"}
					overflow="hidden"
					_before={{
						content: isSettingsActive ? `""` : "initial",
						background: "accentColor",
						height: "full",
						width: "3px",
						position: "absolute",
						borderRadius: "lg",
						left: 0.5,
						top: 0,
					}}
				>
					<Icon onClick={() => setSettingsActive(true)} color="white" cursor="pointer" as={BiCog} boxSize={5} />
				</Center>
				<Avatar
					size='xs'
					cursor={"pointer"}
					name={profile !== null ? profile.username : ""}
					src={profile !== null ? profile.avatar_url : ""}
				/>
			</Flex>
		</Flex>
	);
};

export default Sidebar;
