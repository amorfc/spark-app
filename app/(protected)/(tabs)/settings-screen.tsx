import { View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useProfile } from "@/hooks/useProfile";
import { getFullName } from "@/lib/profile";

export default function Settings() {
	const { signOut } = useAuth();
	const { profile, isLoading } = useProfile();
	const fullName = getFullName(profile);

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			{/* Top Section - User Greeting */}
			<View className="p-6 pt-8">
				<H1 className="text-left mb-2">Settings</H1>
				{isLoading ? (
					<Muted>Loading...</Muted>
				) : fullName ? (
					<>
						<H2 className="text-left mb-1">{getGreeting()},</H2>
						<H2 className="text-left text-primary">{fullName}!</H2>
					</>
				) : (
					<Muted>Welcome to Settings</Muted>
				)}
			</View>

			{/* Middle Section - Settings Options (for future expansion) */}
			<View className="flex-1 px-6">
				{/* This space can be used for additional settings options in the future */}
				<View className="flex-1 justify-center items-center opacity-50">
					<Muted className="text-center"></Muted>
				</View>
			</View>

			{/* Bottom Section - Sign Out */}
			<View className="p-6 pt-4 border-t border-border">
				<View className="mb-4">
					<Text className="text-lg font-semibold mb-2">Account</Text>
					<Muted className="text-sm">
						Sign out and return to the welcome screen.
					</Muted>
				</View>
				<Button
					className="w-full"
					size="default"
					variant="default"
					onPress={async () => {
						await signOut();
					}}
				>
					<Text>Sign Out</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
