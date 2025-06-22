import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useTranslation } from "@/lib/i18n/hooks";
import { LangSelect } from "@/components/select/lang-select";

const getFormSchema = (t: any) =>
	z.object({
		email: z.string().email(t("auth.validation.email_invalid")),
		password: z
			.string()
			.min(8, t("auth.validation.confirm_password_min"))
			.max(64, t("auth.validation.password_max_length")),
	});

export default function SignIn() {
	const { signIn } = useAuth();
	const { t } = useTranslation();

	const formSchema = getFormSchema(t);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signIn(data.email, data.password);

			form.reset();
		} catch (error: Error | any) {
			console.error(error.message);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start ">{t("auth.sign_in")}</H1>
				<Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormInput
									label={t("auth.email")}
									placeholder={t("auth.email")}
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormInput
									label={t("auth.password")}
									placeholder={t("auth.password")}
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
						<LangSelect style={{ borderRadius: 0 }} clearable={false} />
					</View>
				</Form>
			</View>
			<Button
				size="default"
				variant="default"
				onPress={form.handleSubmit(onSubmit)}
				disabled={form.formState.isSubmitting}
				className="web:m-4"
			>
				{form.formState.isSubmitting ? (
					<ActivityIndicator size="small" />
				) : (
					<Text>{t("auth.sign_in")}</Text>
				)}
			</Button>
		</SafeAreaView>
	);
}
