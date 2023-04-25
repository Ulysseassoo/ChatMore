import { NavigateFunction, Outlet, useNavigate } from "react-router";
import { supabase } from "../supabaseClient";
import useAuthStore from "../Store/authStore";
import { useEffect } from "react";

interface Props {
	children: React.ReactNode;
}

const Authentication = ({ children }: Props) => {
	const navigate = useNavigate();
	const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
	const setLoggedOut = useAuthStore((state) => state.setLoggedOut);

	const checkSession = async () => {
		const sessionSupabase = await supabase.auth.getSession();

		if (sessionSupabase.data.session !== null) {
			setLoggedIn(sessionSupabase.data.session);
			navigate("/");
		}
	};

	useEffect(() => {
		const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
			if (session === null) {
				setLoggedOut();
				navigate("/login");
			}
		});

		checkSession();

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	return <> {children} </>;
};

export default Authentication;
