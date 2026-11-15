import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { InlineAlert } from "@/components/InlineAlert";
import { PasswordInput } from "@/components/PasswordInput";
import { authErrorMessage, updatePassword } from "../api";
import { AuthCard, AuthScene } from "./AuthScene";

const schema = z.object({
	password: z
		.string()
		.min(8, "8 caractères minimum")
		.regex(/[a-z]/i, "Ajoute au moins une lettre")
		.regex(/\d/, "Ajoute au moins un chiffre"),
});

export function ResetPasswordPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

	const onSubmit = async ({ password }: z.infer<typeof schema>) => {
		setError(null);
		try {
			await updatePassword(password);
			navigate("/", { replace: true });
		} catch (e) {
			setError(authErrorMessage(e));
		}
	};

	return (
		<AuthScene>
			<AuthCard>
				<Heading as="h1" fontSize="26px" fontWeight={700}>
					Nouveau mot de passe
				</Heading>
				<Text color="cm.muted">Choisis un nouveau mot de passe pour ton compte.</Text>
				<Flex as="form" direction="column" gap={4} onSubmit={handleSubmit(onSubmit)} noValidate>
					<FormControl isInvalid={!!errors.password}>
						<FormLabel>Mot de passe</FormLabel>
						<PasswordInput autoComplete="new-password" {...register("password")} />
						<FormErrorMessage>{errors.password?.message}</FormErrorMessage>
					</FormControl>
					<Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
						Enregistrer
					</Button>
				</Flex>
				{error && <InlineAlert status="error">{error}</InlineAlert>}
			</AuthCard>
		</AuthScene>
	);
}
