import { createBrowserRouter, Navigate } from "react-router-dom";
import { ChatRoom } from "@/features/chat/components/ChatRoom";
import { EmptyChat } from "@/features/chat/components/EmptyChat";
import { AppShell, ProtectedLayout, PublicLayout } from "./layouts";
import { RouteError } from "./RouteError";

export const router = createBrowserRouter([
	{
		element: <PublicLayout />,
		errorElement: <RouteError />,
		children: [
			{
				path: "/login",
				lazy: () => import("@/features/auth/components/LoginPage").then((m) => ({ Component: m.LoginPage })),
			},
			{
				path: "/register",
				lazy: () => import("@/features/auth/components/RegisterPage").then((m) => ({ Component: m.RegisterPage })),
			},
			{
				path: "/check-email",
				lazy: () => import("@/features/auth/components/CheckEmailPage").then((m) => ({ Component: m.CheckEmailPage })),
			},
		],
	},
	{
		element: <ProtectedLayout />,
		errorElement: <RouteError />,
		children: [
			{
				path: "/reset-password",
				lazy: () =>
					import("@/features/auth/components/ResetPasswordPage").then((m) => ({ Component: m.ResetPasswordPage })),
			},
			{
				path: "/",
				element: <AppShell />,
				children: [
					{
						errorElement: <RouteError />,
						children: [
							{ index: true, element: <EmptyChat /> },
							{
								path: "new",
								lazy: () => import("@/features/rooms/components/NewChat").then((m) => ({ Component: m.NewChat })),
							},
							{
								path: "new/group",
								lazy: () => import("@/features/rooms/components/NewGroup").then((m) => ({ Component: m.NewGroup })),
							},
							{
								path: "chat/:roomId",
								element: <ChatRoom />,
								children: [
									{
										path: "info",
										lazy: () => import("@/features/rooms/components/RoomInfo").then((m) => ({ Component: m.RoomInfo })),
									},
								],
							},
							{
								path: "settings",
								lazy: () =>
									import("@/features/settings/components/SettingsPage").then((m) => ({ Component: m.SettingsPage })),
							},
							{
								path: "settings/blocked",
								lazy: () =>
									import("@/features/settings/components/BlockedUsersPage").then((m) => ({
										Component: m.BlockedUsersPage,
									})),
							},
						],
					},
				],
			},
		],
	},
	{ path: "*", element: <Navigate to="/" replace /> },
]);
