import { Flex, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
	date: string;
}

const ChatDate = ({ date }: Props) => {
	const formatDate = () => {
		const todaysDate = new Date();
		const yestersDate = new Date(todaysDate.getDate() - 1);
		switch (date) {
			case todaysDate.toDateString():
				return "Today";
			case yestersDate.toDateString():
				return "Yesterday";
			default:
				return date;
		}
	};

	return (
		<Flex alignItems="center" justifyContent={"center"}>
			<Text
				color="white"
				fontSize={"xs"}
				textAlign={"center"}
				px="3"
				my="2.5"
				shadow="6"
				py="2"
				bg={"headerMenuColor"}
				borderRadius="md"
			>
				{formatDate()}
			</Text>
		</Flex>
	);
};

export default ChatDate;
