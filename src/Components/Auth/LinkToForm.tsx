import { Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { Link as ChakraLink } from "@chakra-ui/react";

type Props = {
	content: string;
	href: string;
	linkTo: string;
};

const LinkToForm = ({ content, href, linkTo }: Props) => {
	return (
		<Text pt="2" as="span" display="inlin-block">
			{content}
			<ChakraLink
				textDecoration="none"
				color="accentColor"
				_hover={{
					color: "accentColorHover",
				}}
				as={Link}
				to={href}
			>
				{linkTo}
			</ChakraLink>
		</Text>
	);
};

export default LinkToForm;
