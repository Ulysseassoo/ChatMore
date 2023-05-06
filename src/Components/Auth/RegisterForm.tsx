import { Box, Button, Center, Flex, Input, Text, Toast, useToast } from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../../supabaseClient";
import useAuthStore from "../../Store/authStore";
import { useNavigate } from "react-router";
import FormTitle from "./FormTitle";

const validationSchema = yup
	.object({
		username: yup
			.string()
			.min(3, "Username must be at least 3 characters")
			.max(30, "Username must be at most 30 characters")
			.required("Username is required"),
		password: yup
			.string()
			.min(4, "Password must be at least 4 characters")
			.max(20, "Password must be at most 20 characters")
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/,
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
			)
			.required("Password is required"),
		email: yup.string().email("Invalid email address").required("Email is required"),
	})
	.required();

type FormData = yup.InferType<typeof validationSchema>;

const RegisterForm = () => {
	const navigate = useNavigate();
	const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
	const toast = useToast();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		reValidateMode: "onChange",
		mode: "onChange",
		resolver: yupResolver(validationSchema),
	});

	const onSubmit = async (formData: FormData) => {
		try {
			const { error, data } = await supabase.auth.signUp(formData);
			if (error) throw error;
			if (data.user !== null) {
				const updates = {
					id: data.user.id,
					username: formData.username,
					email: formData.email,
				};
				const { error: errorProfile } = await supabase.from("profiles").upsert(updates);
				if (errorProfile) throw errorProfile;
				if (data.session !== null) {
					setLoggedIn(data.session);
					navigate("/");
					toast({
						title: "Account created.",
						description: "You will now we logged in.",
						status: "success",
						duration: 3000,
						isClosable: true,
						position: "top-right",
					});
				}
			}
		} catch (error) {
			toast({
				title: "Account error.",
				description: "There was a problem with the registration. Please try again.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
		}
	};

	return (
		<Center py="5" gap="4" flexDir="column">
			<FormTitle title="come chat with anybody !" />
			<Flex flexDir="column" gap="4" as="form" onSubmit={handleSubmit(onSubmit)} w="full" color="black">
				<Box>
					<Input
						variant="filled"
						type="text"
						placeholder="Username"
						background="white"
						borderRadius={"lg"}
						_placeholder={{
							color: "black",
						}}
						_focus={{
							background: "white",
							borderColor: "accentColor",
						}}
						autoComplete="off"
						{...register("username")}
					/>
					{errors?.username && (
						<Text fontSize="xs" pt="1" color="importantColor">
							{errors?.username.message}
						</Text>
					)}
				</Box>

				<Box>
					<Input
						variant="filled"
						type="email"
						placeholder="Email"
						background="white"
						borderRadius={"lg"}
						_placeholder={{
							color: "black",
						}}
						_focus={{
							background: "white",
							borderColor: "accentColor",
						}}
						{...register("email")}
					/>
					{errors?.email && (
						<Text fontSize="xs" pt="1" color="importantColor">
							{errors?.email.message}
						</Text>
					)}
				</Box>

				<Box>
					<Input
						variant="filled"
						type="password"
						placeholder="Password"
						background="white"
						borderRadius={"lg"}
						_placeholder={{
							color: "black",
						}}
						_focus={{
							background: "white",
							borderColor: "accentColor",
						}}
						{...register("password")}
					/>
					{errors?.password && (
						<Text fontSize="xs" pt="1" color="importantColor">
							{errors?.password.message}
						</Text>
					)}
				</Box>

				<Button
					type="submit"
					background="accentColor"
					p="0.6rem"
					color="white"
					borderRadius={"lg"}
					_hover={{
						background: "accentColorHover",
					}}
					loadingText='Submitting'
					isLoading={isSubmitting}
				>
					Register
				</Button>
			</Flex>
		</Center>
	);
};

export default RegisterForm;
