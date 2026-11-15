import { Box, Flex, type FlexProps } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const float = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}`;

const BUBBLES = [
	{ left: "6%", top: "10%", size: 90, delay: "0s", duration: "7s" },
	{ left: "14%", top: "74%", size: 36, delay: "-3s", duration: "9s" },
	{ left: "46%", top: "5%", size: 22, delay: "-6s", duration: "11s" },
	{ right: "8%", top: "14%", size: 54, delay: "-3s", duration: "9s" },
	{ right: "5%", bottom: "10%", size: 120, delay: "0s", duration: "7s" },
	{ left: "52%", bottom: "6%", size: 30, delay: "-6s", duration: "11s" },
];

/** Fond des écrans d'authentification : les petites bulles du logo qui flottent. */
export function AuthScene({ children, ...rest }: FlexProps) {
	return (
		<Flex
			as="main"
			position="relative"
			overflow="hidden"
			minH="100dvh"
			bg="cm.bg"
			align="center"
			justify="center"
			wrap="wrap"
			gap={{ base: 7, lg: 16 }}
			px={{ base: 6, md: 8 }}
			py={{ base: 12, md: 12 }}
			{...rest}
		>
			{BUBBLES.map((b, i) => (
				<Box
					key={i}
					aria-hidden="true"
					position="absolute"
					left={b.left}
					right={b.right}
					top={b.top}
					bottom={b.bottom}
					w={`${b.size}px`}
					h={`${b.size}px`}
					borderRadius="full"
					border="2px solid"
					borderColor="#2E2925"
					animation={`${float} ${b.duration} ease-in-out ${b.delay} infinite`}
					display={{ base: i % 2 ? "none" : "block", md: "block" }}
				/>
			))}
			{children}
		</Flex>
	);
}

export function AuthCard({ children, ...rest }: FlexProps) {
	return (
		<Flex
			position="relative"
			direction="column"
			gap={5}
			w="full"
			maxW="420px"
			p={{ base: 0, md: 8 }}
			bg={{ base: "transparent", md: "cm.surface" }}
			border={{ base: "none", md: "1px solid" }}
			borderColor="#2E2925"
			borderRadius="24px"
			boxShadow={{ base: "none", md: "0 24px 60px rgba(0,0,0,0.45)" }}
			{...rest}
		>
			{children}
		</Flex>
	);
}

export function Wordmark({ size = "44px" }: { size?: string }) {
	return (
		<Box as="span" fontSize={size} fontWeight={800} letterSpacing="0.1em" lineHeight={1.1}>
			CHAT
			<Box as="span" fontWeight={300}>
				MORE
			</Box>
		</Box>
	);
}
