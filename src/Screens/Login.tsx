import React from "react";
import AppTitle from "../Components/Auth/AppTitle";
import Logo from "../assets/Logo.png";
import LinkToForm from "../Components/Auth/LinkToForm";
import { Center, Divider, Image, Box } from "@chakra-ui/react";
import LoginForm from "../Components/Auth/LoginForm";

const Login: React.FC = () => {
	return (
		<Center flexDir="column" p="4" height="100vh">
			<AppTitle />
			<Center height="200px" width="200px" p="1rem" background="headerMenuColor" borderRadius={"3xl"}>
				<Image src={Logo} alt="ChatMore Logo" />
			</Center>
			<Box maxWidth="md" w="100%">
				<LoginForm />
				<Divider />
			</Box>
			<LinkToForm content="Don't have any account ? " href="/register" linkTo="Sign Up" />
		</Center>
	);
};

export default Login;
