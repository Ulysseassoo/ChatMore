import { supabase } from "@/lib/supabase";

export async function registerSubscription(endpoint: string, p256dh: string, auth: string) {
	const { error } = await supabase.rpc("register_push_subscription", {
		p_endpoint: endpoint,
		p_p256dh: p256dh,
		p_auth: auth,
		p_user_agent: navigator.userAgent,
	});
	if (error) throw error;
}

export async function removeSubscription(endpoint: string) {
	const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
	if (error) throw error;
}
