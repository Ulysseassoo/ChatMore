import { useState } from "react";
import { Box, Icon, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { VscSearch } from "react-icons/vsc";

const SearchBar = () => {
	const [search, setSearch] = useState("");

	return (
		<Box>
			<InputGroup alignItems={"center"}>
				<Input
					size="sm"
					borderColor="lineBreakColor"
					boxShadow={"0px 2px 1px -1px rgba(255,255,255,1)"}
					value={search}
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
					onChange={(e) => setSearch(e.target.value)}
				/>
				<InputRightElement height="full" children={<Icon as={VscSearch} color="gray.300" />} />
			</InputGroup>
		</Box>
	);
};

export default SearchBar;
