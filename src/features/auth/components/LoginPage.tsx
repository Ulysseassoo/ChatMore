import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, Link, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { LuMail } from "react-icons/lu";
import { z } from "zod";
import { InlineAlert } from "@/components/InlineAlert";
import { Mascot } from "@/components/Mascot";
import { PasswordInput } from "@/components/PasswordInput";
import { authErrorMessage, resetPassword, sendMagicLink, signIn } from "../api";
import { AuthCard, AuthScene, Wordmark } from "./AuthScene";

const schema = z.object({
	email: z.string().trim().email("Adresse e-mail invalide"),
	password: z.string().min(1, "Saisis ton mot de passe"),
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
	const [feedback, setFeedback] = useState<{ status: "error" | "success"; text: string } | null>(null);
	const [linkPending, setLinkPending] = useState(false);
	const {
		register,
		handleSubmit,
		getValues,
		trigger,
		formState: { errors, isSubmitting },
	} = useForm<Values>({ resolver: zodResolver(schema) });

	const onSubmit = async ({ email, password }: Values) => {
		setFeedback(null);
		try {
			await signIn(email, password);
			// Pas de navigate : le listener met la session à jour et PublicLayout redirige.
		} catch (e) {
			setFeedback({ status: "error", text: authErrorMessage(e) });
		}
	};

	// « Lien magique » et « mot de passe oublié » n'ont besoin que de l'e-mail.
	const withEmail = async (action: (email: string) => Promise<void>, success: string) => {
		setFeedback(null);
		if (!(await trigger("email"))) return;
		const email = getValues("email").trim();
		setLinkPending(true);
		try {
			await action(email);
			setFeedback({ status: "success", text: success.replace("{email}", email) });
		} catch (e) {
			setFeedback({ status: "error", text: authErrorMessage(e) });
		} finally {
			setLinkPending(false);
		}
	};

	return (
		<AuthScene>
			<Flex
				as="section"
				aria-label="Bienvenue"
				position="relative"
				direction="column"
				align="center"
				textAlign="center"
				gap={{ base: 3, lg: 5 }}
				flex={{ base: "1 1 100%", lg: "0 1 460px" }}
			>
				<Mascot size="clamp(180px, 34vw, 400px)" />
				<Heading as="h1" mt={2}>
					<Wordmark size="clamp(32px, 4vw, 44px)" />
				</Heading>
				<Text maxW="360px" fontSize={{ base: "md", lg: "lg" }} color="#C9C0B6" lineHeight={1.6}>
					Des conversations qui pétillent, en temps réel, sur tous vos écrans.
				</Text>
			</Flex>

			<AuthCard>
				<Box>
					<Heading as="h2" fontSize="26px" fontWeight={700} mb={1.5}>
						Content de te revoir
					</Heading>
					<Text color="cm.muted">Connecte-toi pour retrouver tes discussions.</Text>
				</Box>

				<Flex as="form" direction="column" gap={4} onSubmit={handleSubmit(onSubmit)} noValidate>
					<FormControl isInvalid={!!errors.email}>
						<FormLabel>Adresse e-mail</FormLabel>
						<Input type="email" autoComplete="email" placeholder="toi@exemple.fr" {...register("email")} />
						<FormErrorMessage>{errors.email?.message}</FormErrorMessage>
					</FormControl>
					<FormControl isInvalid={!!errors.password}>
						<Flex justify="space-between" align="baseline">
							<FormLabel>Mot de passe</FormLabel>
							<Link
								as="button"
								type="button"
								fontSize="sm"
								color="cm.amberText"
								onClick={() =>
									withEmail(resetPassword, "Si un compte existe pour {email}, un lien de réinitialisation vient d'être envoyé.")
								}
							>
								Oublié ?
							</Link>
						</Flex>
						<PasswordInput autoComplete="current-password" {...register("password")} />
						<FormErrorMessage>{errors.password?.message}</FormErrorMessage>
					</FormControl>
					<Button type="submit" variant="primary" size="lg" mt={1} isLoading={isSubmitting} loadingText="Connexion…">
						Se connecter
					</Button>
				</Flex>

				<Flex align="center" gap={3} color="#9A9189" fontSize="sm" aria-hidden="true">
					<Box flex={1} h="1px" bg="#2E2925" />
					ou
					<Box flex={1} h="1px" bg="#2E2925" />
				</Flex>

				<Button
					size="lg"
					leftIcon={<LuMail size={18} />}
					isLoading={linkPending}
					onClick={() => withEmail(sendMagicLink, "Lien de connexion envoyé à {email}. Ouvre-le sur cet appareil.")}
				>
					Recevoir un lien de connexion
				</Button>

				{feedback && <InlineAlert status={feedback.status}>{feedback.text}</InlineAlert>}

				<Text textAlign="center" color="cm.muted">
					Nouveau sur ChatMore ?{" "}
					<Link as={RouterLink} to="/register" color="cm.amberText" fontWeight={600}>
						Créer un compte
					</Link>
				</Text>
			</AuthCard>
		</AuthScene>
	);
}
