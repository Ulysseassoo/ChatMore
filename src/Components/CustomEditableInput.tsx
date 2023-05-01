import { Editable, Flex, EditablePreview, Input, EditableInput, Text } from "@chakra-ui/react";
import { profile } from "console";
import React from "react";
import CustomEditable from "./CustomEditable";

interface Props {
	defaultValue: string | undefined;
	onSubmit: (e: string) => void;
	title: string;
	placeholder: string;
}

const CustomEditableInput = ({ defaultValue, onSubmit, title, placeholder }: Props) => {
	return (
		<Editable
			defaultValue={defaultValue}
			isPreviewFocusable={false}
			fontSize="md"
			color="whiteAlpha.400"
			display="flex"
			flexDir="column"
			onSubmit={onSubmit}
			placeholder={placeholder}
		>
			<Flex display="inline-flex" alignItems={"center"} justifyContent="space-between">
				<Text fontSize="lg" color="white" fontWeight="bold">
					{title}
				</Text>
				<CustomEditable />
			</Flex>
			<EditablePreview />
			{/* Here is the custom input */}
			<Input as={EditableInput} />
		</Editable>
	);
};

export default CustomEditableInput;
