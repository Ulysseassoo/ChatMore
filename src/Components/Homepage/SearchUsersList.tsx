import { Flex, Divider, Text, Box } from "@chakra-ui/react";
import { supabase } from "../../supabaseClient";
import SearchBar from "./SearchBar";
import useSettingsStore from "../../Store/settingsStore";
import { ChakraBox } from "../../Framer";
import SearchUsersListItem from "./SearchUsersListItem";

const SearchUsersList = () => {
	const toggleContactResearch = useSettingsStore((state) => state.toggleContactResearch);
	const setProfiles = useSettingsStore((state) => state.setProfiles);
	const contactProfiles = useSettingsStore((state) => state.contactProfiles);
	const channels = supabase.getChannels();
	console.log("🚀 ~ file: SearchUsersList.tsx:16 ~ SearchUsersList ~ channels:", channels);

	const handleInputText = async (textValue: string) => {
		const searchText = textValue;
		if (searchText === "") {
			setProfiles([]);
			return;
		}
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.ilike("username", `%${searchText}%`)
				.range(0, 9);
			if (error) throw error.message;
			setProfiles(data);
		} catch (error: any) {
			console.log(error);
		}
	};

	return (
		<ChakraBox
			initial={{ y: "100%" }}
			animate={{ y: 0 }}
			position="absolute"
			background="primaryColor"
			h="full"
			w="full"
			left="0"
			top="0"
			p="4"
			gap="8"
			display="flex"
			flexDir="column"
			// @ts-ignore
			transition={{ delay: 1, duration: 0.6 }}
		>
			<Flex alignItems="center" justifyContent="space-between">
				<Text fontSize="2xl">Add a user</Text>
			</Flex>
			<SearchBar onChange={(e) => handleInputText(e.target.value)} />
			<Divider />
			<Box height="auto" overflowY="scroll">
				{contactProfiles.map((profile) => (
					<SearchUsersListItem key={profile.id} profile={profile} />
				))}
			</Box>
		</ChakraBox>
	);
};

export default SearchUsersList;
