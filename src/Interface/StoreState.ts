export interface SessionState {
	id?: string;
	aud: string;
	username: string;
	email: string;
	role: string;
	last_sign_in_at: string;
	email_confirmed_at: string;
	phone: string;
	confirmed_at: string;
	user_metadata: object;
	app_metadata: object;
	created_at: string;
	updated_at: string;
	identities: [];
}
