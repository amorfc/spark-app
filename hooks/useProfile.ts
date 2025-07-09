import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/services/profiles";
import { Profile } from "@/types/profile";
import { useAuth } from "@/context/supabase-provider";

export const useProfile = () => {
	const { session, isGuest } = useAuth();

	const { data, isLoading, error, refetch } = useQuery<Profile | null>({
		queryKey: ["profile", session?.user?.id],
		enabled: !!session?.user?.id,
		queryFn: () => getCurrentUserProfile(session?.user?.id ?? ""),
	});

	const canCRUD = !isGuest && !!session;

	return { profile: data, isLoading, error, refetch, canCRUD };
};
