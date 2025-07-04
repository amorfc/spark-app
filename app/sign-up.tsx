import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { router } from "expo-router";
import { useTranslation } from "@/lib/i18n/hooks";
import { routes } from "@/lib/routes";
import { KeyboardAwareForm } from "@/components/ui/keyboard-aware-form";
import { LangSelect } from "@/components/select/lang-select";

const getFormSchema = (t: any) =>
	z
		.object({
			firstName: z.string().min(1, t("auth.validation.first_name_required")),
			lastName: z.string().min(1, t("auth.validation.last_name_required")),
			email: z.string().email(t("auth.validation.email_invalid")),
			password: z
				.string()
				.min(6, t("auth.validation.password_min_length"))
				.max(64, t("auth.validation.password_max_length"))
				.regex(/^(?=.*[0-9])/, t("auth.validation.password_needs_number")),
			confirmPassword: z
				.string()
				.min(8, t("auth.validation.confirm_password_min")),
			isFemale: z.boolean().refine((val) => val === true, {
				message: t("auth.validation.female_only"),
			}),
			acceptTerms: z.boolean().refine((val) => val === true, {
				message: t("auth.validation.terms_required"),
			}),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t("auth.validation.passwords_no_match"),
			path: ["confirmPassword"],
		});

export default function SignUp() {
	const { signUp } = useAuth();
	const { t } = useTranslation();

	const formSchema = getFormSchema(t);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			isFemale: false,
			acceptTerms: false,
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signUp(data.email, data.password, {
				firstName: data.firstName,
				lastName: data.lastName,
			});

			form.reset();
		} catch (error: Error | any) {
			Alert.alert(t("common.error"), error.message, [
				{
					text: t("common.ok"),
				},
			]);
		}
	}

	const handleTermsPress = () => router.push(routes.tos());

	return (
		<SafeAreaView className="flex-1 bg-background p-2" edges={["bottom"]}>
			<View className="flex-1 gap-2">
				<H1 className="self-center">{t("auth.sign_up")}</H1>
				<KeyboardAwareForm extraScrollHeight={250}>
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormInput
										label={t("auth.first_name")}
										placeholder={t("auth.first_name")}
										autoCapitalize="none"
										autoCorrect={true}
										{...field}
									/>
								)}
							/>

							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormInput
										label={t("auth.last_name")}
										placeholder={t("auth.last_name")}
										autoCapitalize="none"
										autoCorrect={true}
										{...field}
									/>
								)}
							/>

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
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormInput
										label={t("auth.confirm_password")}
										placeholder={t("auth.confirm_password")}
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry
										{...field}
									/>
								)}
							/>

							{/* Female Only Switch */}
							<FormField
								control={form.control}
								name="isFemale"
								render={({ field }) => (
									<View className="flex-row items-center justify-between">
										<Text className="text-base font-medium">
											{t("auth.female_confirmation")}
										</Text>
										<Switch
											checked={field.value}
											onCheckedChange={(checked: boolean) => {
												field.onChange(checked);
											}}
										/>
									</View>
								)}
							/>
							{form.formState.errors.isFemale && (
								<Text className="text-sm text-destructive">
									{form.formState.errors.isFemale.message}
								</Text>
							)}

							{/* Terms and Conditions Checkbox */}
							<FormField
								control={form.control}
								name="acceptTerms"
								render={({ field }) => (
									<View className="mt-2">
										<Checkbox
											checked={field.value}
											onCheckedChange={(checked: boolean) => {
												field.onChange(checked);
											}}
											renderLabel={() => (
												<Text className="text-sm text-foreground">
													{t("auth.accept_terms") + " "}
													<Text
														className="text-sm text-blue-500 underline"
														onPress={handleTermsPress}
													>
														{t("auth.terms_and_privacy")}
													</Text>
												</Text>
											)}
										/>
										{form.formState.errors.acceptTerms && (
											<Text className="text-sm text-destructive mt-1">
												{form.formState.errors.acceptTerms.message}
											</Text>
										)}
									</View>
								)}
							/>
							<LangSelect style={{ borderRadius: 0 }} clearable={false} />
						</View>
					</Form>
				</KeyboardAwareForm>
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
					<Text>{t("auth.sign_up")}</Text>
				)}
			</Button>
		</SafeAreaView>
	);
}
