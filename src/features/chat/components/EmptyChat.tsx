import { Box, Button, Flex, Heading, Image, Kbd, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { IconCompose, IconGroup } from "@/components/icons";
import logo from "@/assets/Logo.png";

export function EmptyChat() {
	return (
		<Flex h="full" direction="column" align="center" justify="center" gap={4} px={8} textAlign="center">
			<Flex w="180px" h="180px" borderRadius="full" bg="cm.disc" align="center" justify="center">
				<Image src={logo} alt="" w="132px" />
			</Flex>
			<Heading as="h2" fontSize="24px" fontWeight={700} mt={2}>
				Choisis une discussion
			</Heading>
			<Text maxW="380px" color="cm.muted" lineHeight={1.6}>
				Sélectionne une conversation à gauche, ou lance-en une nouvelle avec un ami ou un groupe.
			</Text>
			<Flex gap={2.5} wrap="wrap" justify="center" mt={2}>
				<Button as={RouterLink} to="/new" variant="primary" leftIcon={<IconCompose size={18} />}>
					Nouvelle discussion
				</Button>
				<Button as={RouterLink} to="/new/group" leftIcon={<IconGroup size={18} />}>
					Nouveau groupe
				</Button>
			</Flex>
			<Box mt={4} fontSize="sm" color="#9A9189">
				Astuce : <Kbd bg="transparent" borderColor="cm.lineStrong" color="cm.textSoft">Ctrl</Kbd> +{" "}
				<Kbd bg="transparent" borderColor="cm.lineStrong" color="cm.textSoft">K</Kbd> pour rechercher une discussion
			</Box>
		</Flex>
	);
}
