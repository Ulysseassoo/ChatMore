import { Box, Image, type BoxProps } from "@chakra-ui/react";

const PALETTE = ["#B35A3C", "#3F7A6B", "#4F6FA8", "#8A5A9E", "#6F7F3A", "#9E6A2E", "#A0466E", "#5C6B7A", "#6E5A8A"];

const colorFor = (seed: string) => {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	return PALETTE[Math.abs(h) % PALETTE.length];
};

export const initialsOf = (name: string) => {
	const parts = name
		.replace(/[@._-]+/g, " ")
		.trim()
		.split(/\s+/);
	const letters = parts.length > 1 ? (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "") : name.slice(0, 2);
	return letters.toUpperCase();
};

type Props = BoxProps & {
	name: string;
	seed: string;
	src?: string | null;
	size?: number;
	square?: boolean;
};

export function Avatar({ name, seed, src, size = 48, square = false, ...rest }: Props) {
	const radius = square ? `${Math.round(size * 0.3)}px` : "full";
	return (
		<Box
			flex={`0 0 ${size}px`}
			w={`${size}px`}
			h={`${size}px`}
			borderRadius={radius}
			bg={colorFor(seed)}
			color="white"
			display="flex"
			alignItems="center"
			justifyContent="center"
			fontWeight={600}
			fontSize={`${Math.round(size * 0.34)}px`}
			overflow="hidden"
			aria-hidden="true"
			{...rest}
		>
			{src ? <Image src={src} alt="" w="full" h="full" objectFit="cover" /> : initialsOf(name)}
		</Box>
	);
}
