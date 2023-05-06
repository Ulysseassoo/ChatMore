import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Authentication from "./Authentication";

const AuthenticationWrapper = () => {
	return (
		<>
			<Authentication>
				<Outlet />
			</Authentication>
		</>
	);
};

export default AuthenticationWrapper;
