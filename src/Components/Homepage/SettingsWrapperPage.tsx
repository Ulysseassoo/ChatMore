import { Box, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { BsArrowLeft } from "react-icons/bs";

interface Props {
	name: string;
	children?: React.ReactNode;
}

const SettingsForPage = ({ name, children }: Props) => {
	return (
		<Box
			cursor={"initial"}
			transition="0.3s ease"
			h="full"
			position="absolute"
			zIndex="50"
			top="0"
			right="100%"
			width="full"
		>
			<Box w="full" p="4" background="#403B38" display="inline-flex" gap="4" alignItems="center">
				<Box as="label" htmlFor={name}>
					<Icon cursor={"pointer"} as={BsArrowLeft} boxSize={6} />
				</Box>
				<Text fontSize="2xl">{name}</Text>
			</Box>
			<Box h="full" background="primaryColor">
				{children}
			</Box>
		</Box>
	);
};

export default SettingsForPage;
