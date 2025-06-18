import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import {
	useCreateOrUpdatePostReview,
	useDeletePostReview,
} from "@/hooks/usePosts";
import { PostReviewWithProfile } from "@/types/posts";
import { useTranslation } from "@/lib/i18n/hooks";

const getPostReviewFormSchema = (t: any) =>
	z.object({
		text: z
			.string()
			.min(1, "Please enter your review text")
			.max(1000, "Review text must be less than 1000 characters"),
	});

type PostReviewFormData = z.infer<ReturnType<typeof getPostReviewFormSchema>>;

interface PostReviewFormProps {
	postId: string;
	existingReview?: PostReviewWithProfile | null;
	onSuccess?: () => void;
	onCancel?: () => void;
	className?: string;
}

const PostReviewForm: React.FC<PostReviewFormProps> = ({
	postId,
	existingReview,
	onSuccess,
	onCancel,
	className,
}) => {
	const { t } = useTranslation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createOrUpdateMutation = useCreateOrUpdatePostReview();
	const deleteMutation = useDeletePostReview();
	const postReviewFormSchema = getPostReviewFormSchema(t);

	const form = useForm<PostReviewFormData>({
		resolver: zodResolver(postReviewFormSchema),
		defaultValues: {
			text: existingReview?.text || "",
		},
	});

	// Update form when existing review changes
	useEffect(() => {
		if (existingReview) {
			form.setValue("text", existingReview.text);
		} else {
			form.setValue("text", "");
		}
	}, [existingReview, form]);

	const onSubmit = async (data: PostReviewFormData) => {
		setIsSubmitting(true);
		try {
			await createOrUpdateMutation.mutateAsync({
				postId,
				data: { text: data.text },
			});

			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Error submitting post review:", error);
			Alert.alert(
				t("common.error"),
				error instanceof Error ? error.message : "Failed to submit review",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!existingReview) return;

		Alert.alert(
			"Delete Review",
			"Are you sure you want to delete your review?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteMutation.mutateAsync({
								reviewId: existingReview.id,
								postId: postId,
							});
							form.reset();
							onSuccess?.();
						} catch (error) {
							Alert.alert(t("common.error"), "Failed to delete review");
						}
					},
				},
			],
		);
	};

	const isLoading = createOrUpdateMutation.isPending || isSubmitting;
	const isDeleting = deleteMutation.isPending;

	return (
		<View className={cn("space-y-4", className)}>
			<Text className="font-semibold text-foreground">
				{existingReview ? "Update your review" : "Add a review"}
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
									placeholder="Share your thoughts about this post..."
									value={field.value || ""}
									onChangeText={field.onChange}
									onBlur={field.onBlur}
									className="min-h-20"
									maxLength={1000}
								/>
								<FormMessage />
								<Text className="text-xs text-muted-foreground text-right">
									{field.value?.length || 0}/1000 characters
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
								disabled={isLoading || isDeleting}
								className="flex-1"
							>
								<Text>{t("common.cancel")}</Text>
							</Button>
						)}

						<Button
							onPress={form.handleSubmit(onSubmit)}
							disabled={isLoading || isDeleting || !form.watch("text")?.trim()}
							className="flex-1"
						>
							<Text>
								{isLoading
									? "Submitting..."
									: existingReview
										? "Update Review"
										: "Submit Review"}
							</Text>
						</Button>

						{existingReview && (
							<Button
								variant="destructive"
								onPress={handleDelete}
								disabled={isLoading || isDeleting}
								className="px-4"
							>
								<Text>{isDeleting ? "Deleting..." : "Delete"}</Text>
							</Button>
						)}
					</View>
				</View>
			</Form>
		</View>
	);
};

export { PostReviewForm };
