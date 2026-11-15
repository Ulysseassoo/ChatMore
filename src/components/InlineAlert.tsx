import { Flex, Text } from "@chakra-ui/react";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";

export function InlineAlert({ status, children }: { status: "error" | "success"; children: React.ReactNode }) {
	const Icon = status === "error" ? LuCircleAlert : LuCircleCheck;
	return (
		<Flex
			role={status === "error" ? "alert" : "status"}
			align="flex-start"
			gap={2}
			color={status === "error" ? "cm.danger" : "cm.success"}
			fontSize="sm"
		>
			<Icon size={17} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
			<Text>{children}</Text>
		</Flex>
	);
}
