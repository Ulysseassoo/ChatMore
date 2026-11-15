import { Flex, Text } from "@chakra-ui/react";
import { IconOffline } from "@/components/icons";
import { useOnline } from "@/lib/useOnline";

export function OfflineBanner() {
	if (useOnline()) return null;
	return (
		<Flex
			role="status"
			align="center"
			justify="center"
			gap={2}
			py={2}
			px={4}
			bg="#FFF1D0"
			color="#5C430C"
			fontSize="sm"
			fontWeight={500}
		>
			<IconOffline size={16} aria-hidden="true" />
			<Text>Hors ligne. Tes messages partiront dès le retour du réseau.</Text>
		</Flex>
	);
}
