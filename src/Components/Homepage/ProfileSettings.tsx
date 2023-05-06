import { Flex, Box, Image, Avatar, Text, Center, useToast, Spinner, Grid } from "@chakra-ui/react";
import { useRef, useState } from "react";
import useAuthStore from "../../Store/authStore";
import { supabase } from "../../supabaseClient";
import CustomEditableInput from "../CustomEditableInput";

interface FormData {
	username: string;
	about: string;
	phone: string;
}

type InputType = "username" | "about" | "phone";

const ProfileSettings = () => {
	const [isLoadingPicture, setIsLoadingPicture] = useState(false);
	const fileRef = useRef<HTMLInputElement | null>(null);
	const profile = useAuthStore((state) => state.profile);
	const setProfile = useAuthStore((state) => state.setProfile);
	const toast = useToast();

	const handleClick = () => {
		console.log(fileRef.current);
		if (fileRef.current !== null) {
			fileRef.current.click();
		}
	};

	const uploadImage = async (file: File) => {
		const fileExt = file.name.split(".").pop();
		const fileName = `${Math.random()}.${fileExt}`;
		const filePath = `${fileName}`;

		try {
			const { error: uploadError, data: imageData } = await supabase.storage.from("avatars").upload(filePath, file, {
				contentType: `image/${fileExt}`,
			});

			if (uploadError) {
				throw uploadError;
			}

			const avatar_url = imageData?.path;
			if (avatar_url !== undefined && profile !== null) {
				const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(avatar_url);
				const updates = {
					id: profile.id,
					avatar_url: urlData.publicUrl,
					updated_at: new Date().toISOString(),
					username: profile?.username,
				};
				// Get updated profile back
				const { error: newError, data: newData } = await supabase.from("profiles").upsert(updates).select().single();
				if (newError) throw Error;
				if (newData !== null) {
					setProfile(newData);
					setIsLoadingPicture(false);
					toast({
						title: "Success",
						description: "Your profile picture has been updated !",
						status: "success",
						position: "top-right",
						duration: 3000,
						isClosable: true,
					});
				}
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.error_description || error.message,
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
		}
	};

	const updateInput = async (input: string, type: InputType) => {
		try {
			if (profile !== null) {
				const normalProfile = {
					id: profile?.id,
					about: profile?.about,
					updated_at: new Date().toISOString(),
					username: profile?.username,
					phone: profile?.phone,
				};

				if (input !== normalProfile[type]) {
					const updates = {
						...normalProfile,
						[type]: input,
					};

					const { error, data } = await supabase.from("profiles").upsert(updates).select().single();
					if (error) throw error;
					setProfile(data);
					toast({
						title: "Success",
						description: "Your profile has been updated !",
						status: "success",
						duration: 3000,
						isClosable: true,
						position: "top-right",
					});
				}
			}
		} catch (error) {
			toast({
				title: "Profile error.",
				description: "There was a problem with the update. Please try again.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
		}
	};

	return (
		<Flex h="full" w="full" flexDir={"column"}>
			<Flex flex="30%" h="30%">
				{profile?.avatar_url !== "" ? (
					<Grid gridTemplateAreas={"1fr"} gridTemplateColumns={"1fr"}>
						<Box gridArea="1 / 1 / 2 / 2" background="blackAlpha.700" zIndex={1} />

						<Image
							gridArea="1 / 1 / 2 / 2"
							h="full"
							w="full"
							backgroundRepeat={"no-repeat"}
							objectFit={"cover"}
							src={profile?.avatar_url}
						/>
					</Grid>
				) : (
					<Center w="full">
						<Text color="whiteAlpha.400">You have no profile picture</Text>
					</Center>
				)}
			</Flex>
			<Flex
				flex="70%"
				background="primaryColor"
				borderRadius="50px 50px 0 0"
				position="relative"
				top="-35px"
				boxShadow=" rgba(0, 0, 0, 0.1) 0px -2px 1px 0px, rgba(0, 0, 0, 0.06) 0px -2px 1px 0px"
				flexDir="column"
				gap="4"
				padding="0 1.5rem"
				zIndex={2}
			>
				<Flex alignItems="center" w="full" gap="4">
					<Grid
						placeItems="center"
						position="relative"
						h="100px"
						w="100px"
						gridTemplateAreas={"1fr"}
						gridTemplateColumns={"1fr"}
					>
						<Avatar
							borderRadius="full"
							h="100px"
							border="3px solid"
							borderColor="secondaryColor"
							w="100px"
							position="relative"
							cursor={"pointer"}
							top="-15px"
							src={profile?.avatar_url}
							name={profile?.username}
							onClick={handleClick}
							transition="0.3s ease"
							gridArea="1 / 1 / 2 / 2"
							_hover={{
								opacity: 0.65,
							}}
						/>
						{isLoadingPicture ? <Spinner position="relative" top="-15px" gridArea="1 / 1 / 2 / 2" /> : null}
						<input
							style={{
								display: "none",
							}}
							accept="image/jpeg, image/png"
							type="file"
							ref={fileRef}
							onChange={(e) => {
								if (e.target.files !== null && e.target.files.length > 0) {
									setIsLoadingPicture(true);
									uploadImage(e.target.files[0]);
								}
							}}
						/>
					</Grid>

					<Flex flexDir="column" alignItems="start">
						<Box color="white" display="inline-flex" gap="0.8rem" alignItems={"center"}>
							<Text fontSize="xl">{profile?.username}</Text>
						</Box>
						<Text color="whiteAlpha.300">Online</Text>
					</Flex>
				</Flex>

				<Flex flexDir="column">
					<CustomEditableInput
						defaultValue={profile?.about}
						placeholder="You have no bio"
						onSubmit={(e) => updateInput(e, "about")}
						title="About me"
					/>
				</Flex>

				<Flex flexDir="column">
					<CustomEditableInput
						defaultValue={profile?.phone}
						onSubmit={(e) => updateInput(e, "phone")}
						title="Phone number"
						placeholder="You have no phone number"
					/>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default ProfileSettings;
