import { Heading } from "@chakra-ui/react";
import React from "react";

const FormTitle = ({ title }: { title: string }) => {
	return (
		<Heading fontSize="2xl" as="h2" textTransform={"capitalize"} fontWeight="normal" fontFamily="body">
			{title}
		</Heading>
	);
};

export default FormTitle;
