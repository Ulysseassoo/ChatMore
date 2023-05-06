import { useState } from "react";
import { Box, Icon, Input, InputGroup, InputProps, InputRightElement, Spinner } from "@chakra-ui/react";
import { VscSearch } from "react-icons/vsc";

interface Props {
	isLoading?: boolean;
}

const SearchBar = ({ isLoading, ...rest }: InputProps & Props) => {
	return (
		<Box>
			<InputGroup alignItems={"center"}>
				<Input
					size="sm"
					borderColor="lineBreakColor"
					boxShadow={"0px 2px 1px -1px rgba(255,255,255,1)"}
					_hover={{
						borderColor: "lineBreakColor",
					}}
					_focus={{
						borderColor: "lineBreakColor",
						boxShadow: "0px 2px 1px -1px rgba(230,175,46,1)",
					}}
					_placeholder={{
						color: "white",
					}}
					borderRadius={"md"}
					placeholder="Search for a message"
					{...rest}
				/>
				<InputRightElement
					height="full"
					children={isLoading ? <Spinner size='sm' color="accentColor" /> : <Icon as={VscSearch} color="gray.300" />}
				/>
			</InputGroup>
		</Box>
	);
};

export default SearchBar;
