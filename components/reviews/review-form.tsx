import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import { H3 } from "@/components/ui/typography";
import { StarRating } from "@/components/reviews/star-rating";
import { cn } from "@/lib/utils";

import { useUpsertReview } from "@/hooks/useReviews";
import { Review } from "@/types/reviews";
import { useTranslation } from "@/lib/i18n/hooks";

const getReviewFormSchema = (t: any) =>
	z.object({
		safety_rating: z
			.number()
			.min(1, t("reviews.form.safety_rating_required"))
			.max(5),
		quality_rating: z
			.number()
			.min(1, t("reviews.form.quality_rating_required"))
			.max(5),
		comment: z.string().optional(),
	});

type ReviewFormData = z.infer<ReturnType<typeof getReviewFormSchema>>;

interface ReviewFormProps {
	featureRefId: string;
	existingReview?: Review | null;
	onSuccess?: () => void;
	onCancel?: () => void;
	className?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
	featureRefId,
	existingReview,
	onSuccess,
	onCancel,
	className,
}) => {
	const { t } = useTranslation();
	const [safetyRating, setSafetyRating] = useState(
		existingReview?.safety_rating || 0,
	);
	const [qualityRating, setQualityRating] = useState(
		existingReview?.quality_rating || 0,
	);

	const upsertMutation = useUpsertReview();
	const reviewFormSchema = getReviewFormSchema(t);

	const form = useForm<ReviewFormData>({
		resolver: zodResolver(reviewFormSchema),
		defaultValues: {
			safety_rating: existingReview?.safety_rating || 0,
			quality_rating: existingReview?.quality_rating || 0,
			comment: existingReview?.comment || "",
		},
	});

	// Update form when ratings change
	useEffect(() => {
		form.setValue("safety_rating", safetyRating);
	}, [safetyRating, form]);

	useEffect(() => {
		form.setValue("quality_rating", qualityRating);
	}, [qualityRating, form]);

	const onSubmit = async (data: ReviewFormData) => {
		try {
			await upsertMutation.mutateAsync({
				feature_ref_id: featureRefId,
				safety_rating: data.safety_rating,
				quality_rating: data.quality_rating,
				comment: data.comment,
			});

			form.reset();
			setSafetyRating(0);
			setQualityRating(0);
			onSuccess?.();
		} catch (error) {
			console.error("Error submitting review:", error);
			Alert.alert(
				t("common.error"),
				error instanceof Error ? error.message : t("reviews.form.submit_error"),
			);
		}
	};

	const isLoading = upsertMutation.isPending;

	return (
		<View className={cn("space-y-4 p-4", className)}>
			<H3 className="text-center">
				{existingReview
					? t("reviews.update_review")
					: t("reviews.leave_review")}
			</H3>

			<Form {...form}>
				<View className="space-y-4">
					{/* Safety Rating */}
					<FormField
						control={form.control}
						name="safety_rating"
						render={({ field }) => (
							<View className="space-y-2">
								<Text className="font-semibold">
									{t("reviews.safety_rating")}
								</Text>
								<StarRating
									rating={safetyRating}
									onRatingChange={setSafetyRating}
									size="lg"
								/>
								<FormMessage />
							</View>
						)}
					/>

					{/* Quality Rating */}
					<FormField
						control={form.control}
						name="quality_rating"
						render={({ field }) => (
							<View className="space-y-2">
								<Text className="font-semibold">
									{t("reviews.quality_rating")}
								</Text>
								<StarRating
									rating={qualityRating}
									onRatingChange={setQualityRating}
									size="lg"
								/>
								<FormMessage />
							</View>
						)}
					/>

					{/* Comment */}
					<FormField
						control={form.control}
						name="comment"
						render={({ field }) => (
							<View className="space-y-2">
								<Text className="font-semibold">
									{t("reviews.comment_optional")}
								</Text>
								<Textarea
									placeholder={t("reviews.share_experience")}
									value={field.value || ""}
									onChangeText={field.onChange}
									onBlur={field.onBlur}
									className="min-h-20"
								/>
								<FormMessage />
							</View>
						)}
					/>

					{/* Buttons */}
					<View className="flex-row space-x-2 pt-4">
						<Button
							variant="outline"
							onPress={onCancel}
							disabled={isLoading}
							className="flex-1"
						>
							<Text>{t("common.cancel")}</Text>
						</Button>
						<Button
							onPress={form.handleSubmit(onSubmit)}
							disabled={isLoading || safetyRating === 0 || qualityRating === 0}
							className="flex-1"
						>
							<Text>
								{isLoading
									? t("reviews.form.submitting")
									: existingReview
										? t("reviews.update_review_button")
										: t("reviews.submit_review")}
							</Text>
						</Button>
					</View>
				</View>
			</Form>
		</View>
	);
};

export { ReviewForm };
