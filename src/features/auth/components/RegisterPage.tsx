import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	InputGroup,
	InputLeftElement,
	Link,
	List,
	ListItem,
	Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { LuCheckCheck, LuLock, LuMessageSquare } from "react-icons/lu";
import { z } from "zod";
import { InlineAlert } from "@/components/InlineAlert";
import { PasswordInput } from "@/components/PasswordInput";
import logo from "@/assets/Logo.png";
import { authErrorMessage, signUp } from "../api";
import { passwordStrength, USERNAME_PATTERN, useUsernameCheck } from "../hooks";
import { AuthCard, AuthScene } from "./AuthScene";
import { UsernameStatus } from "./UsernameStatus";

const schema = z.object({
	username: z
		.string()
		.trim()
		.toLowerCase()
		.regex(USERNAME_PATTERN, "3 à 24 caractères : lettres minuscules, chiffres, point ou tiret bas"),
	email: z.string().trim().email("Adresse e-mail invalide"),
	password: z
		.string()
		.min(8, "8 caractères minimum")
		.regex(/[a-z]/i, "Ajoute au moins une lettre")
		.regex(/\d/, "Ajoute au moins un chiffre"),
});
type Values = z.infer<typeof schema>;

const PERKS = [
	{ icon: LuMessageSquare, text: "Messages en temps réel, en privé ou en groupe" },
	{ icon: LuCheckCheck, text: "Confirmations de lecture, que tu peux désactiver" },
	{ icon: LuLock, text: "Bloque qui tu veux, discrètement" },
];

export function RegisterPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<Values>({ resolver: zodResolver(schema) });

	const usernameState = useUsernameCheck(watch("username") ?? "");
	const strength = passwordStrength(watch("password") ?? "");

	const onSubmit = async (values: Values) => {
		setError(null);
		if (usernameState === "taken") return setError("Ce nom d'utilisateur est déjà pris.");
		try {
			const needsConfirmation = await signUp(values);
			if (needsConfirmation) navigate("/check-email", { state: { email: values.email } });
		} catch (e) {
			setError(authErrorMessage(e));
		}
	};

	return (
		<AuthScene>
			<Flex
				as="section"
				aria-label="Présentation"
				position="relative"
				direction="column"
				gap={6}
				flex={{ base: "1 1 100%", lg: "0 1 420px" }}
				align={{ base: "center", lg: "flex-start" }}
				textAlign={{ base: "center", lg: "left" }}
			>
				<Flex
					w={{ base: "120px", lg: "160px" }}
					h={{ base: "120px", lg: "160px" }}
					borderRadius="full"
					bg="cm.disc"
					align="center"
					justify="center"
				>
					<Box as="img" src={logo} alt="" w="74%" />
				</Flex>
				<Heading as="h1" fontSize={{ base: "30px", lg: "38px" }} fontWeight={800} lineHeight={1.15}>
					Rejoins ChatMore
				</Heading>
				<List spacing={3.5} display={{ base: "none", lg: "block" }} color="cm.textSoft" fontSize="md">
					{PERKS.map(({ icon: Icon, text }) => (
						<ListItem key={text} display="flex" alignItems="center" gap={3}>
							<Flex
								flex="0 0 32px"
								h="32px"
								borderRadius="10px"
								bg="cm.amberTint"
								color="cm.amberText"
								align="center"
								justify="center"
							>
								<Icon size={18} aria-hidden="true" />
							</Flex>
							{text}
						</ListItem>
					))}
				</List>
			</Flex>

			<AuthCard maxW="440px">
				<Heading as="h2" fontSize="26px" fontWeight={700}>
					Créer un compte
				</Heading>
				<Flex as="form" direction="column" gap={4} onSubmit={handleSubmit(onSubmit)} noValidate>
					<FormControl isInvalid={!!errors.username || usernameState === "taken"}>
						<FormLabel>Nom d'utilisateur</FormLabel>
						<InputGroup>
							<InputLeftElement h="50px" color="#9A9189" pointerEvents="none">
								@
							</InputLeftElement>
							<Input
								autoComplete="username"
								autoCapitalize="none"
								pl="34px"
								aria-describedby="username-status"
								{...register("username")}
							/>
						</InputGroup>
						{errors.username ? (
							<FormErrorMessage>{errors.username.message}</FormErrorMessage>
						) : (
							<UsernameStatus state={usernameState} id="username-status" />
						)}
					</FormControl>
					<FormControl isInvalid={!!errors.email}>
						<FormLabel>Adresse e-mail</FormLabel>
						<Input type="email" autoComplete="email" placeholder="toi@exemple.fr" {...register("email")} />
						<FormErrorMessage>{errors.email?.message}</FormErrorMessage>
					</FormControl>
					<FormControl isInvalid={!!errors.password}>
						<FormLabel>Mot de passe</FormLabel>
						<PasswordInput autoComplete="new-password" aria-describedby="password-strength" {...register("password")} />
						<Flex gap={1} mt={2} aria-hidden="true">
							{[1, 2, 3, 4].map((i) => (
								<Box
									key={i}
									flex={1}
									h="4px"
									borderRadius="2px"
									bg={i <= strength.score ? "cm.amber" : "cm.lineStrong"}
								/>
							))}
						</Flex>
						{errors.password ? (
							<FormErrorMessage>{errors.password.message}</FormErrorMessage>
						) : (
							<Text id="password-strength" mt={1.5} fontSize="sm" color="#C9C0B6" aria-live="polite">
								{strength.label || "8 caractères minimum, avec des lettres et des chiffres."}
							</Text>
						)}
					</FormControl>
					<Button type="submit" variant="primary" size="lg" mt={1} isLoading={isSubmitting} loadingText="Création…">
						Créer mon compte
					</Button>
				</Flex>
				{error && <InlineAlert status="error">{error}</InlineAlert>}
				<Text textAlign="center" color="cm.muted">
					Déjà inscrit ?{" "}
					<Link as={RouterLink} to="/login" color="cm.amberText" fontWeight={600}>
						Se connecter
					</Link>
				</Text>
			</AuthCard>
		</AuthScene>
	);
}
