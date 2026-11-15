import { Flex } from "@chakra-ui/react";
import { LuCheck, LuCircleAlert, LuLoaderCircle } from "react-icons/lu";
import type { UsernameCheck } from "../hooks";

const TEXT: Record<Exclude<UsernameCheck, "idle" | "unchanged">, string> = {
	checking: "Vérification…",
	available: "Disponible",
	taken: "Déjà pris",
	invalid: "3 à 24 caractères : lettres minuscules, chiffres, point ou tiret bas",
};

export function UsernameStatus({ state, id }: { state: UsernameCheck; id: string }) {
	if (state === "idle" || state === "unchanged") return <span id={id} />;
	const Icon = state === "available" ? LuCheck : state === "checking" ? LuLoaderCircle : LuCircleAlert;
	const color = state === "available" ? "cm.success" : state === "checking" ? "cm.muted" : "cm.danger";
	return (
		<Flex id={id} aria-live="polite" align="center" gap={1.5} mt={1.5} fontSize="sm" color={color}>
			<Icon size={15} aria-hidden="true" />
			{TEXT[state]}
		</Flex>
	);
}
