import { Flex, Heading, IconButton } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { IconClose } from "@/components/icons";

export function PanelHeader({ title }: { title: string }) {
	return (
		<Flex
			align="center"
			h="68px"
			pl={5}
			pr={2}
			borderBottom="1px solid"
			borderColor="cm.line"
			position="sticky"
			top={0}
			bg="cm.surface"
			zIndex={1}
		>
			<Heading as="h2" flex={1} fontSize="16px" fontWeight={700}>
				{title}
			</Heading>
			<IconButton
				as={RouterLink}
				to=".."
				relative="path"
				aria-label="Fermer"
				icon={<IconClose size={18} />}
				variant="ghost"
			/>
		</Flex>
	);
}
