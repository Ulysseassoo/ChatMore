export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: {
			images: {
				Row: {
					id: number;
					created_at: string | null;
					url: string | null;
					message_id: number | null;
					message_room_id: number | null;
					message_user_id: string | null;
				};
				Insert: {
					id?: number;
					created_at?: string | null;
					url?: string | null;
					message_id?: number | null;
					message_room_id?: number | null;
					message_user_id?: string | null;
				};
				Update: {
					id?: number;
					created_at?: string | null;
					url?: string | null;
					message_id?: number | null;
					message_room_id?: number | null;
					message_user_id?: string | null;
				};
			};
			message: {
				Row: {
					id: number;
					created_at: string;
					room: number;
					user: string;
					view: boolean;
					content: string;
					isBlocked: boolean;
				};
				Insert: {
					id?: number;
					created_at?: string;
					room?: number;
					user?: string;
					view?: boolean;
					content: string;
					isBlocked?: boolean;
				};
				Update: {
					id?: number;
					created_at?: string;
					room?: number;
					user?: string;
					view?: boolean;
					content?: string;
					isBlocked?: boolean;
				};
			};
			profiles: {
				Row: {
					id: string;
					updated_at: string | null;
					email: string | null;
					username: string;
					avatar_url: string;
					phone: string;
					about: string;
				};
				Insert: {
					id: string;
					updated_at?: string | null;
					email?: string | null;
					username: string;
					avatar_url?: string;
					phone?: string;
					about?: string;
				};
				Update: {
					id?: string;
					updated_at?: string | null;
					email?: string | null;
					username?: string;
					avatar_url?: string;
					phone?: string;
					about?: string;
				};
			};
			room: {
				Row: {
					id: number;
					created_at: string | null;
				};
				Insert: {
					id?: number;
					created_at?: string | null;
				};
				Update: {
					id?: number;
					created_at?: string | null;
				};
			};
			userHasBlockedRoom: {
				Row: {
					id: number;
					created_at: string | null;
					blocking_user_id: string;
					room_id: number;
				};
				Insert: {
					id?: number;
					created_at?: string | null;
					blocking_user_id: string;
					room_id: number;
				};
				Update: {
					id?: number;
					created_at?: string | null;
					blocking_user_id?: string;
					room_id?: number;
				};
			};
			userHasRoom: {
				Row: {
					room: number | null;
					user: string | null;
				};
				Insert: {
					room?: number | null;
					user?: string | null;
				};
				Update: {
					room?: number | null;
					user?: string | null;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			getusersbyroom: {
				Args: Record<PropertyKey, never>;
				Returns: unknown;
			};
			getusersbyrooms: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
	};
}
