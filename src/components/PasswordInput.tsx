import { IconButton, Input, InputGroup, InputRightElement, type InputProps } from "@chakra-ui/react";
import { forwardRef, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(props, ref) {
	const [visible, setVisible] = useState(false);
	return (
		<InputGroup>
			<Input ref={ref} type={visible ? "text" : "password"} pr="52px" {...props} />
			<InputRightElement h="50px" w="50px">
				<IconButton
					variant="ghost"
					size="sm"
					h="44px"
					minW="44px"
					aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
					aria-pressed={visible}
					icon={visible ? <LuEyeOff size={20} /> : <LuEye size={20} />}
					onClick={() => setVisible((v) => !v)}
				/>
			</InputRightElement>
		</InputGroup>
	);
});
