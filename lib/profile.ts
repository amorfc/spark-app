import { Profile } from "@/types/profile";

export const getFullName = (profile: Profile | null | undefined) => {
	if (!profile) {
		return "";
	}

	return `${profile.first_name} ${profile.last_name}`;
};
