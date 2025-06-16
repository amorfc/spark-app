import { supabase } from "@/config/supabase";
import type { Profile } from "@/types/profile";

export async function getCurrentUserProfile(
	userId: string,
): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) {
		console.error("Error fetching profile:", error);
		return null;
	}

	return data;
}

export async function updateProfile(
	firstName: string,
	lastName: string,
): Promise<boolean> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user?.id) {
		return false;
	}

	const { error } = await supabase
		.from("profiles")
		.update({
			first_name: firstName,
			last_name: lastName,
		})
		.eq("id", session.user.id);

	if (error) {
		console.error("Error updating profile:", error);
		return false;
	}

	return true;
}
