import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "@/lib/i18n/hooks";
import { ReportType } from "@/types/moderation";
import { colors } from "@/constants/colors";

const getReportFormSchema = (t: any) =>
	z.object({
		report_type: z.enum([
			"inappropriate_content",
			"spam",
			"harassment",
			"hate_speech",
			"violence",
			"misinformation",
			"copyright",
			"other",
		] as const),
		description: z.string().optional(),
	});

type ReportFormData = z.infer<ReturnType<typeof getReportFormSchema>>;

interface ReportFormProps {
	onSubmit: (data: ReportFormData) => Promise<void>;
	onCancel: () => void;
	contentType: "post" | "review" | "post_review";
	authorName: string;
	isLoading: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({
	onSubmit,
	onCancel,
	contentType,
	authorName,
	isLoading,
}) => {
	const { t } = useTranslation();
	const reportFormSchema = getReportFormSchema(t);

	const form = useForm<ReportFormData>({
		resolver: zodResolver(reportFormSchema),
		defaultValues: {
			report_type: "inappropriate_content",
			description: "",
		},
	});

	const reportTypes: { value: ReportType; label: string }[] = [
		{
			value: "inappropriate_content",
			label: t("moderation.report_types.inappropriate_content"),
		},
		{ value: "spam", label: t("moderation.report_types.spam") },
		{ value: "harassment", label: t("moderation.report_types.harassment") },
		{ value: "hate_speech", label: t("moderation.report_types.hate_speech") },
		{ value: "violence", label: t("moderation.report_types.violence") },
		{
			value: "misinformation",
			label: t("moderation.report_types.misinformation"),
		},
		{ value: "copyright", label: t("moderation.report_types.copyright") },
		{ value: "other", label: t("moderation.report_types.other") },
	];

	const handleSubmit = async (data: ReportFormData) => {
		await onSubmit(data);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
				<Text className="text-xl font-semibold">
					{t("moderation.report_form.title")}
				</Text>
				<TouchableOpacity
					onPress={onCancel}
					disabled={isLoading}
					className="p-2"
				>
					<MaterialIcons
						name="close"
						size={24}
						color={colors.light.mutedForeground}
					/>
				</TouchableOpacity>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 p-4">
				<View className="mb-4">
					<Text className="text-sm text-muted-foreground">
						{t("moderation.reporting_content_by", {
							contentType: t(`moderation.content_types.${contentType}`),
							authorName: authorName,
						})}
					</Text>
				</View>

				<Form {...form}>
					<View className="space-y-6">
						{/* Report Type Selection */}
						<FormField
							control={form.control}
							name="report_type"
							render={({ field }) => (
								<View className="space-y-3">
									<Text className="font-semibold text-base">
										{t("moderation.report_form.reason")}
									</Text>
									<RadioGroup
										value={field.value}
										onValueChange={field.onChange}
									>
										{reportTypes.map((option) => (
											<TouchableOpacity
												key={option.value}
												onPress={() => field.onChange(option.value)}
												className="flex-row items-center space-x-3 py-2"
											>
												<View className="w-5 h-5 rounded-full border-2 border-primary items-center justify-center">
													{field.value === option.value && (
														<View className="w-2.5 h-2.5 rounded-full bg-primary" />
													)}
												</View>
												<Text className="text-base flex-1">{option.label}</Text>
											</TouchableOpacity>
										))}
									</RadioGroup>
									<FormMessage />
								</View>
							)}
						/>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<View className="space-y-2">
									<Text className="font-semibold text-base">
										{t("moderation.report_form.description")}
									</Text>
									<Textarea
										placeholder={t(
											"moderation.report_form.description_placeholder",
										)}
										value={field.value || ""}
										onChangeText={field.onChange}
										onBlur={field.onBlur}
										className="min-h-24"
										maxLength={500}
									/>
									<FormMessage />
									<Text className="text-xs text-muted-foreground text-right">
										{field.value?.length || 0}/500 {t("common.characters")}
									</Text>
								</View>
							)}
						/>
					</View>
				</Form>
			</ScrollView>

			{/* Footer */}
			<View className="p-4 border-t border-border">
				<View className="flex-row space-x-3">
					<Button
						variant="outline"
						onPress={onCancel}
						disabled={isLoading}
						className="flex-1"
					>
						<Text>{t("common.cancel")}</Text>
					</Button>
					<Button
						onPress={form.handleSubmit(handleSubmit)}
						disabled={isLoading}
						className="flex-1"
					>
						<Text>
							{isLoading
								? t("common.submitting")
								: t("moderation.report_as_inappropriate")}
						</Text>
					</Button>
				</View>
			</View>
		</SafeAreaView>
	);
};
