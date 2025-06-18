import React, { useEffect } from "react";
import { View, Alert } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { useCreatePost, useUpdatePost } from "@/hooks/usePosts";
import { Post } from "@/types/posts";
import { useTranslation } from "@/lib/i18n/hooks";

const getPostFormSchema = (t: any) =>
	z.object({
		content: z
			.string()
			.min(1, "Please enter your post content")
			.max(2000, "Post content must be less than 2000 characters"),
	});

type PostFormData = z.infer<ReturnType<typeof getPostFormSchema>>;

interface PostFormProps {
	postId?: string; // Optional - only provided for updates
	existingPost?: Post | null;
	onSuccess?: () => void;
	onCancel?: () => void;
	className?: string;
}

const PostForm: React.FC<PostFormProps> = ({
	postId,
	existingPost,
	onSuccess,
	onCancel,
	className,
}) => {
	const { t } = useTranslation();

	const createMutation = useCreatePost();
	const updateMutation = useUpdatePost();
	const postFormSchema = getPostFormSchema(t);

	const isEditing = !!existingPost;

	const form = useForm<PostFormData>({
		resolver: zodResolver(postFormSchema),
		defaultValues: {
			content: existingPost?.content || "",
		},
	});

	// Update form when existing post changes
	useEffect(() => {
		if (existingPost) {
			form.setValue("content", existingPost.content);
		} else {
			form.setValue("content", "");
		}
	}, [existingPost, form]);

	const onSubmit = async (data: PostFormData) => {
		try {
			if (isEditing && postId) {
				// Update existing post
				await updateMutation.mutateAsync({
					postId,
					data: { content: data.content },
				});
			} else {
				// Create new post
				await createMutation.mutateAsync({
					content: data.content,
				});
			}

			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Error submitting post:", error);
			Alert.alert(
				t("common.error"),
				error instanceof Error ? error.message : "Failed to save post",
			);
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<View className={cn("space-y-4 p-4", className)}>
			<Form {...form}>
				<View className="space-y-4">
					{/* Post Content */}
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<View className="space-y-2">
								<Text className="font-semibold mb-2">Whats on your mind?</Text>
								<Textarea
									placeholder="Share your thoughts with the community..."
									value={field.value || ""}
									onChangeText={field.onChange}
									onBlur={field.onBlur}
									className="min-h-32"
									maxLength={2000}
								/>
								<FormMessage />
								<Text className="text-xs text-muted-foreground text-right">
									{field.value?.length || 0}/2000 characters
								</Text>
							</View>
						)}
					/>

					{/* Buttons */}
					<View className="flex-row space-x-2 pt-4">
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
							disabled={isLoading || !form.watch("content")?.trim()}
							className="flex-1"
						>
							<Text>
								{isLoading
									? "Saving..."
									: isEditing
										? "Update Post"
										: "Create Post"}
							</Text>
						</Button>
					</View>
				</View>
			</Form>
		</View>
	);
};

export { PostForm };
