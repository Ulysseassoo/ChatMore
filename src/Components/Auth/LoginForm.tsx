import { Box, Button, Center, Flex, Input, Text, useToast } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { supabase } from "../../supabaseClient";
import useAuthStore from "../../Store/authStore";
import { useNavigate } from "react-router";
import FormTitle from "./FormTitle";

const validationSchema = yup
	.object({
		password: yup.string().required("Password is required"),
		email: yup.string().email("Invalid email address").required("Email is required"),
	})
	.required();

type FormData = yup.InferType<typeof validationSchema>;

const LoginForm = () => {
	const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
	const navigation = useNavigate();
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
			const { error, data } = await supabase.auth.signInWithPassword(formData);
			if (error) throw error;
			if (data.session !== null) {
				setLoggedIn(data.session);
				toast({
					title: "Successfully Logged in.",
					description: "You will now be redirected.",
					status: "success",
					position: "top-right",
					duration: 3000,
					isClosable: true,
				});
				navigation("/");
			}
		} catch (error: any) {
			toast({
				title: "Login error",
				description: error.error_description || error.message,
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
		}
	};

	return (
		<Center py="5" gap="4" flexDir="column">
			<FormTitle title="let's start with hello !" />
			<Flex flexDir="column" gap="4" as="form" onSubmit={handleSubmit(onSubmit)} w="full" color="black">
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
					Login
				</Button>
			</Flex>
		</Center>
	);
};

export default LoginForm;
