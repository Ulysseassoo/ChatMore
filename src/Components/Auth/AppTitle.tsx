import { Heading, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
	size?: string;
	pb?: string;
}

const AppTitle = ({ size, pb }: Props) => {
	return (
		<Heading
			fontSize={size ?? "2.5rem"}
			color="white"
			letterSpacing={"2px"}
			textTransform={"uppercase"}
			fontWeight="bold"
			pb={pb ?? "2"}
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
