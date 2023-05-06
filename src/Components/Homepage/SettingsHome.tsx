import { Box, Flex, Icon, Text, useMediaQuery, useToast } from "@chakra-ui/react";
import { FiUser } from "react-icons/fi";
import SettingsWrapperPage from "./SettingsWrapperPage";
import ProfileSettings from "./ProfileSettings";
import { AiOutlineLogout } from "react-icons/ai";
import useAuthStore from "../../Store/authStore";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router";

const data = [
	{
		Icon: FiUser,
		name: "Profile",
	},
	// {
	// 	Icon: FiUserX,
	// 	name: "Bloqued Users",
	// },
];

const SettingsHome = () => {
	const setLoggedOut = useAuthStore((state) => state.setLoggedOut);
	const toast = useToast();
	const navigate = useNavigate();
	const [isIpad] = useMediaQuery("(max-width: 1025px)");

	const logout = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			setLoggedOut();
			navigate("/login");
			toast({
				title: "Disconnected",
				description: "You have successfully logged out.",
				status: "success",
				position: "top-right",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.log("🚀 ~ file: SettingsHome.tsx:34 ~ logout ~ error:", error);
		}
	};

	return (
		<Flex
			flexDir="column"
			position="absolute"
			top="0"
			left="0"
			background="primaryColor"
			height="full"
			zIndex={2}
			w={isIpad ? "full" : "450px"}
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

			<Box
				display="flex"
				alignItems="center"
				borderBottom={"1px solid"}
				borderColor="lineBreakColor"
				_hover={{
					background: "lineBreakColor",
				}}
				onClick={logout}
			>
				<Box color="importantColor" w="full" cursor={"pointer"} p="4" display="inline-flex" gap="4">
					<Icon as={AiOutlineLogout} boxSize={6} />
					<Text>Logout</Text>
				</Box>
			</Box>
		</Flex>
	);
};

export default SettingsHome;
