import { Outlet, useNavigate } from "react-router";
import { supabase } from "../supabaseClient";
import useAuthStore from "../Store/authStore";
import { useEffect } from "react";

const Authentication = () => {
	const navigate = useNavigate();
	const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
	const setLoggedOut = useAuthStore((state) => state.setLoggedOut);

	const checkSession = async () => {
		const sessionSupabase = await supabase.auth.getSession();

		if (sessionSupabase.data.session !== null) {
			setLoggedIn(sessionSupabase.data.session);
		}
	};

	useEffect(() => {
		checkSession();

		const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (session === null) {
				navigate("/login");
			}
			if (session !== null) {
				setLoggedIn(session);
				navigate("/");
			}

			switch (event) {
				case "SIGNED_IN":
					// Update the user data if user connects is active
					if (session !== null) {
						setLoggedIn(session);
						navigate("/");
					}
					break;
				case "SIGNED_OUT":
					setLoggedOut();
					navigate("/login");
					break;
				default:
					break;
			}
		});
	}, []);

	return <Outlet />;
};

export default Authentication;
