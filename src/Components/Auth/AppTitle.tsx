import { Heading, Text } from "@chakra-ui/react";
import React from "react";

const AppTitle = () => {
	return (
		<Heading
			fontSize={"2.5rem"}
			color="white"
			letterSpacing={"2px"}
			textTransform={"uppercase"}
			fontWeight="bold"
			pb="2"
			fontFamily="heading"
		>
			Chat
			<Text as="span" fontWeight={"thin"}>
				More
			</Text>
		</Heading>
	);
};

export default AppTitle;
