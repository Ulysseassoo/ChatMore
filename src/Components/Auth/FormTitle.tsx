import { Heading } from "@chakra-ui/react";
import React from "react";
import styled from "styled-components";

const FormTitle = ({ title }: { title: string }) => {
	return (
		<Heading
			fontSize="2xl"
			as="h2"
			textTransform={"capitalize"}
			fontWeight="normal"
			fontFamily="body"
		>
			{title}
		</Heading>
	);
};

const Title = styled.h2`
	color: ${({ theme }) => theme.white};
	text-transform: capitalize;
	font-weight: normal;
	@media (max-width: 520px) {
		font-size: 1.3rem;
	}
`;

export default FormTitle;
