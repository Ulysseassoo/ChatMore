export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: { Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json }; Returns: Json };
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			blocks: {
				Row: {
					blocked_id: string;
					blocker_id: string;
					created_at: string;
				};
				ComputedFields: never;
				Insert: {
					blocked_id: string;
					blocker_id?: string;
					created_at?: string;
				};
				Update: {
					blocked_id?: string;
					blocker_id?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "blocks_blocked_id_fkey";
						columns: ["blocked_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "blocks_blocker_id_fkey";
						columns: ["blocker_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			hidden_messages: {
				Row: {
					created_at: string;
					message_id: number;
					user_id: string;
				};
				ComputedFields: never;
				Insert: {
					created_at?: string;
					message_id: number;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					message_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "hidden_messages_message_id_fkey";
						columns: ["message_id"];
						isOneToOne: false;
						referencedRelation: "messages";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "hidden_messages_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			message_attachments: {
				Row: {
					created_at: string;
					duration_ms: number | null;
					height: number | null;
					id: number;
					kind: Database["public"]["Enums"]["attachment_kind"];
					message_id: number;
					mime_type: string;
					size_bytes: number;
					storage_path: string;
					width: number | null;
				};
				ComputedFields: never;
				Insert: {
					created_at?: string;
					duration_ms?: number | null;
					height?: number | null;
					id?: never;
					kind: Database["public"]["Enums"]["attachment_kind"];
					message_id: number;
					mime_type: string;
					size_bytes: number;
					storage_path: string;
					width?: number | null;
				};
				Update: {
					created_at?: string;
					duration_ms?: number | null;
					height?: number | null;
					id?: never;
					kind?: Database["public"]["Enums"]["attachment_kind"];
					message_id?: number;
					mime_type?: string;
					size_bytes?: number;
					storage_path?: string;
					width?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "message_attachments_message_id_fkey";
						columns: ["message_id"];
						isOneToOne: false;
						referencedRelation: "messages";
						referencedColumns: ["id"];
					},
				];
			};
			message_reactions: {
				Row: {
					created_at: string;
					emoji: string;
					message_id: number;
					user_id: string;
				};
				ComputedFields: never;
				Insert: {
					created_at?: string;
					emoji: string;
					message_id: number;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					emoji?: string;
					message_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "message_reactions_message_id_fkey";
						columns: ["message_id"];
						isOneToOne: false;
						referencedRelation: "messages";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "message_reactions_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			messages: {
				Row: {
					client_id: string | null;
					content: string;
					created_at: string;
					deleted_at: string | null;
					edited_at: string | null;
					forwarded: boolean;
					id: number;
					is_blocked: boolean;
					reply_to_id: number | null;
					room_id: number;
					user_id: string;
					message_payload: Json | null;
				};
				ComputedFields: "message_payload";
				Insert: {
					client_id?: string | null;
					content?: string;
					created_at?: string;
					deleted_at?: string | null;
					edited_at?: string | null;
					forwarded?: boolean;
					id?: never;
					is_blocked?: boolean;
					reply_to_id?: number | null;
					room_id: number;
					user_id?: string;
				};
				Update: {
					client_id?: string | null;
					content?: string;
					created_at?: string;
					deleted_at?: string | null;
					edited_at?: string | null;
					forwarded?: boolean;
					id?: never;
					is_blocked?: boolean;
					reply_to_id?: number | null;
					room_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "messages_reply_to_id_fkey";
						columns: ["reply_to_id"];
						isOneToOne: false;
						referencedRelation: "messages";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "messages_room_id_fkey";
						columns: ["room_id"];
						isOneToOne: false;
						referencedRelation: "rooms";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "messages_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			profiles: {
				Row: {
					about: string;
					avatar_url: string | null;
					created_at: string;
					id: string;
					phone: string | null;
					read_receipts: boolean;
					show_online: Database["public"]["Enums"]["online_visibility"];
					updated_at: string;
					username: string;
				};
				ComputedFields: never;
				Insert: {
					about?: string;
					avatar_url?: string | null;
					created_at?: string;
					id: string;
					phone?: string | null;
					read_receipts?: boolean;
					show_online?: Database["public"]["Enums"]["online_visibility"];
					updated_at?: string;
					username: string;
				};
				Update: {
					about?: string;
					avatar_url?: string | null;
					created_at?: string;
					id?: string;
					phone?: string | null;
					read_receipts?: boolean;
					show_online?: Database["public"]["Enums"]["online_visibility"];
					updated_at?: string;
					username?: string;
				};
				Relationships: [];
			};
			room_members: {
				Row: {
					joined_at: string;
					last_read_at: string;
					muted: boolean;
					read_receipt_at: string | null;
					role: Database["public"]["Enums"]["member_role"];
					room_id: number;
					user_id: string;
				};
				ComputedFields: never;
				Insert: {
					joined_at?: string;
					last_read_at?: string;
					muted?: boolean;
					read_receipt_at?: string | null;
					role?: Database["public"]["Enums"]["member_role"];
					room_id: number;
					user_id: string;
				};
				Update: {
					joined_at?: string;
					last_read_at?: string;
					muted?: boolean;
					read_receipt_at?: string | null;
					role?: Database["public"]["Enums"]["member_role"];
					room_id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "room_members_room_id_fkey";
						columns: ["room_id"];
						isOneToOne: false;
						referencedRelation: "rooms";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "room_members_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			rooms: {
				Row: {
					avatar_url: string | null;
					created_at: string;
					created_by: string | null;
					direct_key: string | null;
					id: number;
					last_message_at: string | null;
					name: string | null;
					type: Database["public"]["Enums"]["room_type"];
				};
				ComputedFields: never;
				Insert: {
					avatar_url?: string | null;
					created_at?: string;
					created_by?: string | null;
					direct_key?: string | null;
					id?: never;
					last_message_at?: string | null;
					name?: string | null;
					type: Database["public"]["Enums"]["room_type"];
				};
				Update: {
					avatar_url?: string | null;
					created_at?: string;
					created_by?: string | null;
					direct_key?: string | null;
					id?: never;
					last_message_at?: string | null;
					name?: string | null;
					type?: Database["public"]["Enums"]["room_type"];
				};
				Relationships: [
					{
						foreignKeyName: "rooms_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			add_members: { Args: { p_member_ids: string[]; p_room_id: number }; Returns: undefined };
			attachment_room_id: { Args: { p_name: string }; Returns: number };
			can_listen_topic: { Args: { p_topic: string }; Returns: boolean };
			can_read_attachment: { Args: { p_name: string }; Returns: boolean };
			can_see_message: { Args: { p_message_id: number }; Returns: boolean };
			can_track_presence: { Args: { p_topic: string }; Returns: boolean };
			create_group: { Args: { p_member_ids: string[]; p_name: string }; Returns: number };
			delete_message: { Args: { p_for_everyone: boolean; p_message_id: number }; Returns: string[] };
			direct_peer: { Args: { p_room_id: number; p_user_id: string }; Returns: string };
			edit_message: { Args: { p_content: string; p_message_id: number }; Returns: undefined };
			ensure_group_admin: { Args: { p_room_id: number }; Returns: undefined };
			forward_message: { Args: { p_message_id: number; p_room_ids: number[] }; Returns: number };
			get_messages: {
				Args: { p_before_created_at?: string; p_before_id?: number; p_limit?: number; p_room_id: number };
				Returns: {
					client_id: string;
					content: string;
					created_at: string;
					deleted_at: string;
					edited_at: string;
					forwarded: boolean;
					id: number;
					read_count: number;
					reply_to_id: number;
					room_id: number;
					status: string;
					user_id: string;
				}[];
			};
			get_my_rooms: {
				Args: Record<PropertyKey, never>;
				Returns: {
					avatar_url: string;
					i_blocked_peer: boolean;
					last_activity_at: string;
					last_message: Json;
					member_count: number;
					muted: boolean;
					my_last_read_at: string;
					name: string;
					peer: Json;
					room_id: number;
					type: Database["public"]["Enums"]["room_type"];
					unread_count: number;
				}[];
			};
			get_or_create_direct_room: { Args: { p_other: string }; Returns: number };
			get_profile: {
				Args: { p_user_id: string };
				Returns: {
					about: string;
					avatar_url: string;
					id: string;
					phone: string;
					read_receipts: boolean;
					show_online: Database["public"]["Enums"]["online_visibility"];
					username: string;
				}[];
			};
			get_room_members: {
				Args: { p_room_id: number };
				Returns: {
					avatar_url: string;
					joined_at: string;
					read_receipt_at: string;
					role: Database["public"]["Enums"]["member_role"];
					user_id: string;
					username: string;
				}[];
			};
			i_blocked_peer: { Args: { p_room_id: number }; Returns: boolean };
			is_room_admin: { Args: { p_room_id: number }; Returns: boolean };
			is_room_member: { Args: { p_room_id: number }; Returns: boolean };
			is_username_available: { Args: { p_username: string }; Returns: boolean };
			leave_room: { Args: { p_room_id: number }; Returns: undefined };
			mark_room_read: { Args: { p_room_id: number }; Returns: undefined };
			message_payload: {
				Args: {
					m: Omit<
						Database["public"]["Tables"]["messages"]["Row"],
						Database["public"]["Tables"]["messages"]["ComputedFields"]
					>;
				};
				Returns: Json;
			};
			my_joined_at: { Args: { p_room_id: number }; Returns: string };
			remove_member: { Args: { p_room_id: number; p_user_id: string }; Returns: undefined };
			search_messages: {
				Args: { p_limit?: number; p_query: string; p_room_id: number };
				Returns: {
					content: string;
					created_at: string;
					id: number;
					user_id: string;
				}[];
			};
			search_profiles: {
				Args: { p_limit?: number; p_query: string };
				Returns: {
					avatar_url: string;
					direct_room_id: number;
					id: string;
					username: string;
				}[];
			};
			send_attachment: {
				Args: {
					p_client_id?: string;
					p_content?: string;
					p_duration_ms?: number;
					p_height?: number;
					p_kind: Database["public"]["Enums"]["attachment_kind"];
					p_mime_type: string;
					p_room_id: number;
					p_size_bytes: number;
					p_storage_path: string;
					p_width?: number;
				};
				Returns: number;
			};
			set_member_role: {
				Args: { p_role: Database["public"]["Enums"]["member_role"]; p_room_id: number; p_user_id: string };
				Returns: undefined;
			};
		};
		Enums: {
			attachment_kind: "image" | "file" | "audio";
			member_role: "admin" | "member";
			online_visibility: "contacts" | "nobody";
			room_type: "direct" | "group";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {
			attachment_kind: ["image", "file", "audio"],
			member_role: ["admin", "member"],
			online_visibility: ["contacts", "nobody"],
			room_type: ["direct", "group"],
		},
	},
} as const;
