import { useQuery } from "@tanstack/react-query";
import { useUserId } from "@/features/auth/session";
import { fetchBlocks, fetchProfile } from "./api";

export const profileKey = (userId: string) => ["profile", userId] as const;
export const blocksKey = ["blocks"] as const;

export function useProfile(userId: string | null | undefined) {
	return useQuery({
		queryKey: profileKey(userId ?? ""),
		queryFn: () => fetchProfile(userId!),
		enabled: !!userId,
	});
}

export function useMyProfile() {
	return useProfile(useUserId());
}

export function useBlocks() {
	return useQuery({ queryKey: blocksKey, queryFn: fetchBlocks });
}
