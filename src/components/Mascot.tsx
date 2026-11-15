import { Box, Image, type BoxProps } from "@chakra-ui/react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useRef, useState } from "react";
import mascot from "@/assets/lottie/chatmore-logo.json";
import logo from "@/assets/Logo.png";
import { useReducedMotion } from "@/features/settings/preferences";

export function Mascot({ size, ...rest }: BoxProps & { size: string }) {
	const reduce = useReducedMotion();
	const ref = useRef<LottieRefCurrentProps>(null);
	const [ready, setReady] = useState(false);

	return (
		<Box
			position="relative"
			w={size}
			h={size}
			borderRadius="full"
			bg="cm.disc"
			display="flex"
			alignItems="center"
			justifyContent="center"
			flexShrink={0}
			{...rest}
		>
			<Box w="82%" role="img" aria-label="Mascotte ChatMore : deux bulles de discussion qui pétillent">
				<Lottie
					lottieRef={ref}
					animationData={mascot}
					autoplay={!reduce}
					loop={false}
					onDOMLoaded={() => {
						setReady(true);
						if (reduce) ref.current?.goToAndStop(40, true);
					}}
					onComplete={() => {
						if (!reduce) {
							const item = ref.current?.animationItem;
							if (item) item.loop = true;
							ref.current?.playSegments([40, 120], true);
						}
					}}
				/>
			</Box>
			{!ready && <Image src={logo} alt="" position="absolute" w="70%" />}
		</Box>
	);
}
