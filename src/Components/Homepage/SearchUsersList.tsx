import { Flex, Divider, Text, Box, Icon } from "@chakra-ui/react";
import { supabase } from "../../supabaseClient";
import SearchBar from "./SearchBar";
import useSettingsStore from "../../Store/settingsStore";
import { ChakraBox } from "../../Framer";
import SearchUsersListItem from "./SearchUsersListItem";
import { BsArrowLeft } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import useDebounce from "../Hooks/useDebounce";
import { Profile } from "../../Interface/Types";
import { useEffect, useState } from "react";
import useAuthStore from "../../Store/authStore";

const container = {
	hidden: {
		opacity: 0,
		transition: {
			when: "afterChildren",
		},
	},
	show: {
		opacity: 1,
		transition: {
			when: "beforeChildren",
			staggerChildren: 0.3,
		},
	},
};

const SearchUsersList = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const toggleContactResearch = useSettingsStore((state) => state.toggleContactResearch);
	const setProfiles = useSettingsStore((state) => state.setProfiles);
	const contactProfiles = useSettingsStore((state) => state.contactProfiles);
	const actualProfile = useAuthStore((state) => state.profile);
	const debouncedValue = useDebounce<string>(searchText, 500);

	const handleInputText = async (textValue: string) => {
		setSearchText(textValue);
		setIsLoading(true);
	};

	const fetchProfiles = async () => {
		if (debouncedValue === "") {
			setProfiles([]);
			setIsLoading(false);
			return;
		}
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.ilike("username", `%${debouncedValue}%`)
				.range(0, 9);
			if (error) throw error.message;
			const otherProfiles = data.filter((p) => p.id !== actualProfile?.id);
			setProfiles(otherProfiles);
			setIsLoading(false);
		} catch (error: any) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchProfiles();
	}, [debouncedValue]);

	return (
		<ChakraBox
			initial={{ x: "-100%" }}
			animate={{ x: 0 }}
			exit={{ x: "-100%" }}
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
			transition={{
				duration: 0.3,
			}}
		>
			<Flex alignItems="center" gap="2">
				<Icon cursor={"pointer"} onClick={toggleContactResearch} as={BsArrowLeft} boxSize={6} />
				<Text fontSize="2xl">Add a user</Text>
			</Flex>
			<SearchBar isLoading={isLoading} value={searchText} onChange={(e) => handleInputText(e.target.value)} />
			<Divider />
			{!isLoading && (
				<ChakraBox variants={container} initial="hidden" animate="show" height="auto" overflowY="scroll">
					{contactProfiles.map((profile) => (
						<SearchUsersListItem key={profile.id} profile={profile} />
					))}
				</ChakraBox>
			)}
		</ChakraBox>
	);
};

export default SearchUsersList;
