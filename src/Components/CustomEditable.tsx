import { useEditableControls, ButtonGroup, IconButton, Flex, Icon } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";

const CustomEditable = () => {
	const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = useEditableControls();

	return isEditing ? (
		<ButtonGroup justifyContent='center' size='sm'>
			<IconButton
				_hover={{
					background: "transparent",
				}}
				_pressed={{
					background: "transparent",
				}}
				_focus={{
					background: "transparent",
				}}
				background="transparent"
				icon={<Icon as={BsCheckLg} color="accentColor" />}
				{...getSubmitButtonProps()}
				aria-label="submit"
			/>
			<IconButton
				_hover={{
					background: "transparent",
				}}
				_pressed={{
					background: "transparent",
				}}
				_focus={{
					background: "transparent",
				}}
				background="transparent"
				icon={<Icon as={AiOutlineClose} color="importantColor" />}
				{...getCancelButtonProps()}
				aria-label="cancel"
			/>
		</ButtonGroup>
	) : (
		<Flex justifyContent='center'>
			<IconButton
				size='sm'
				background="transparent"
				_hover={{
					background: "transparent",
				}}
				_pressed={{
					background: "transparent",
				}}
				_focus={{
					background: "transparent",
				}}
				icon={<Icon as={FaEdit} color="white" />}
				aria-label="edit"
				{...getEditButtonProps()}
			/>
		</Flex>
	);
};

export default CustomEditable;
