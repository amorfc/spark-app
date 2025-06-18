import React, { useState } from "react";
import { View, Alert } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { useCreatePostReview } from "@/hooks/usePosts";
import { useTranslation } from "@/lib/i18n/hooks";

const maxReviewLength = 400;
const getPostReviewFormSchema = (t: any) =>
	z.object({
		text: z
			.string()
			.min(1, t("posts.reviews.validation.text_required"))
			.max(
				maxReviewLength,
				t("posts.reviews.validation.text_max_length", {
					max: maxReviewLength,
				}),
			),
	});

type PostReviewFormData = z.infer<ReturnType<typeof getPostReviewFormSchema>>;

interface PostReviewFormProps {
	postId: string;
	onSuccess?: () => void;
	onCancel?: () => void;
	className?: string;
}

const PostReviewForm: React.FC<PostReviewFormProps> = ({
	postId,
	onSuccess,
	onCancel,
	className,
}) => {
	const { t } = useTranslation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createMutation = useCreatePostReview();
	const postReviewFormSchema = getPostReviewFormSchema(t);

	const form = useForm<PostReviewFormData>({
		resolver: zodResolver(postReviewFormSchema),
		defaultValues: {
			text: "",
		},
	});

	const onSubmit = async (data: PostReviewFormData) => {
		setIsSubmitting(true);
		try {
			await createMutation.mutateAsync({
				postId,
				data: { text: data.text },
			});

			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Error submitting post review:", error);
			Alert.alert(
				t("common.error"),
				error instanceof Error
					? error.message
					: t("posts.reviews.submit_error"),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const isLoading = createMutation.isPending || isSubmitting;

	return (
		<View className={cn("space-y-4", className)}>
			<Text className="font-semibold text-foreground">
				{t("posts.reviews.add_review")}
			</Text>

			<Form {...form}>
				<View className="space-y-4">
					{/* Review Text */}
					<FormField
						control={form.control}
						name="text"
						render={({ field }) => (
							<View className="space-y-2">
								<Textarea
									placeholder={t("posts.reviews.review_placeholder")}
									value={field.value || ""}
									onChangeText={field.onChange}
									onBlur={field.onBlur}
									className="min-h-20"
									maxLength={maxReviewLength}
								/>
								<FormMessage />
								<Text className="text-xs text-muted-foreground text-right">
									{field.value?.length || 0}/{maxReviewLength}{" "}
									{t("common.characters")}
								</Text>
							</View>
						)}
					/>

					{/* Buttons */}
					<View className="flex-row space-x-2">
						{onCancel && (
							<Button
								variant="outline"
								onPress={onCancel}
								disabled={isLoading}
								className="flex-1"
							>
								<Text>{t("common.cancel")}</Text>
							</Button>
						)}

						<Button
							onPress={form.handleSubmit(onSubmit)}
							disabled={isLoading || !form.watch("text")?.trim()}
							className="flex-1"
						>
							<Text>
								{isLoading
									? t("common.submitting")
									: t("posts.reviews.submit_review")}
							</Text>
						</Button>
					</View>
				</View>
			</Form>
		</View>
	);
};

export { PostReviewForm };
