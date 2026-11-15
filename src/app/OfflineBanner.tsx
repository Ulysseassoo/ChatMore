import { Flex, Text } from "@chakra-ui/react";
import { useSyncExternalStore } from "react";
import { IconOffline } from "@/components/icons";

const subscribe = (cb: () => void) => {
	window.addEventListener("online", cb);
	window.addEventListener("offline", cb);
	return () => {
		window.removeEventListener("online", cb);
		window.removeEventListener("offline", cb);
	};
};

export function OfflineBanner() {
	const online = useSyncExternalStore(subscribe, () => navigator.onLine);
	if (online) return null;
	return (
		<Flex role="status" align="center" justify="center" gap={2} py={2} px={4} bg="#FFF1D0" color="#5C430C" fontSize="sm" fontWeight={500}>
			<IconOffline size={16} aria-hidden="true" />
			<Text>Hors ligne. L'historique reste consultable ; tes messages pourront être renvoyés au retour du réseau.</Text>
		</Flex>
	);
}
