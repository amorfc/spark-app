import { PostReviewCard } from "@/components/ui/card/post-review-card";
import { PaginatedFlatList } from "@/components/ui/list/paginated-flatlist";
import { usePostReviewsInfinite } from "@/hooks/usePosts";
import { useTranslation } from "@/lib/i18n/hooks";
import { PostReviewWithProfile } from "@/types/posts";

interface PostReviewListProps {
	postId: string;
	onReviewPress: (review: PostReviewWithProfile) => void;
}

export const PostReviewList = ({
	postId,
	onReviewPress,
}: PostReviewListProps) => {
	const { t } = useTranslation();
	const {
		data: reviews,
		isLoading,
		isRefetching,
		refetch,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = usePostReviewsInfinite(postId);

	if (!reviews) return null;

	return (
		<PaginatedFlatList
			data={reviews.pages.flatMap((page) => page.reviews)}
			renderItem={({ item }) => (
				<PostReviewCard item={item} onPress={() => onReviewPress(item)} />
			)}
			keyExtractor={(item) => item.id}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			fetchNextPage={fetchNextPage}
			isRefetching={isRefetching}
			isLoading={isLoading}
			onRefresh={refetch}
			emptyStateMessage={t("empty_states.no_posts")}
			emptyStateSubtitle={t("empty_states.be_first_poster")}
		/>
	);
};
