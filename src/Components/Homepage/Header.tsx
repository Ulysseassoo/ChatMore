import React from "react";
import Logo from "../../assets/Logo.png";
import AppTitle from "../Auth/AppTitle";
import { Box, Flex, Image } from "@chakra-ui/react";

const Header = () => {
	return (
		<Flex
			alignItems="center"
			gap="2"
			flexDir="row"
			w="full"
			background="rgba(43, 40, 38, 1)"
			px="4"
			gridArea={"header"}
		>
			<AppTitle pb="0" size="1.2rem" />
			<Box w="30px" h="30px">
				<Image src={Logo} alt="ChatMore Logo" />
			</Box>
		</Flex>
	);
};

export default Header;
