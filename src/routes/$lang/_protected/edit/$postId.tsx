import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { EditPostForm } from "~/components/post/EditPostForm";
import { useI18n } from "~/shared/providers/i18n";
import { browserQueryClient } from "~/shared/providers/tanstackQuery";
import type { UpdatePostFormInput } from "~/shared/schemas/post";
import { unpublishPostFn } from "~/shared/services/admin";
import { publishPostFn, updatePostFn } from "~/shared/services/post";
import {
	categoriesOptions,
	postForEditOptions,
	tagsOptions,
} from "~/shared/tanstackQueries/post";

export const Route = createFileRoute("/$lang/_protected/edit/$postId")({
	loader: async ({ params }) => {
		const qc = browserQueryClient;
		if (!qc) return;
		await Promise.all([
			qc.ensureQueryData(postForEditOptions(params.postId)),
			qc.ensureQueryData(categoriesOptions()),
			qc.ensureQueryData(tagsOptions()),
		]);
	},
	component: EditPostPage,
});

function EditPostPage() {
	const { t } = useI18n();
	const { lang, postId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const postQuery = useQuery(postForEditOptions(postId));

	const updateMutation = useMutation({
		mutationFn: (input: UpdatePostFormInput) => updatePostFn({ data: input }),
		onSuccess: () => {
			toast.success(t.editor.updated);
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (err) => {
			const raw = err instanceof Error ? err.message : "";
			const message = raw.includes("SLUG_TAKEN")
				? t.editor.slugTaken
				: raw.includes("POST_NOT_FOUND")
					? t.editor.postNotFound
					: t.editor.errorUpdating;
			toast.error(message);
		},
	});

	const publishMutation = useMutation({
		mutationFn: () => publishPostFn({ data: { postId } }),
		onSuccess: (result) => {
			toast.success(t.editor.published);
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			const slug = result.slug;
			if (slug) {
				navigate({
					to: "/$lang/posts/$slug",
					params: { lang, slug },
				});
			}
		},
		onError: (err) => {
			const raw = err instanceof Error ? err.message : "";
			const message = raw.includes("POST_NOT_FOUND")
				? t.editor.postNotFound
				: t.editor.errorUpdating;
			toast.error(message);
		},
	});

	const unpublishMutation = useMutation({
		mutationFn: () => unpublishPostFn({ data: { postId } }),
		onSuccess: () => {
			toast.success(t.editor.unpublished);
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (err) => {
			const raw = err instanceof Error ? err.message : "";
			const message = raw.includes("NOT_FOUND")
				? t.editor.postNotFound
				: t.editor.errorUpdating;
			toast.error(message);
		},
	});

	const isSubmitting =
		updateMutation.isPending ||
		publishMutation.isPending ||
		unpublishMutation.isPending;

	if (postQuery.isLoading) {
		return (
			<div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
				<p className='text-zinc-600 dark:text-zinc-400'>{t.common.loading}</p>
			</div>
		);
	}

	if (postQuery.isError || !postQuery.data) {
		return (
			<div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
				<p className='text-red-600 dark:text-red-400'>
					{t.editor.postNotFound}
				</p>
				<a
					href={`/${lang}`}
					className='mt-4 inline-block text-sm text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300'
				>
					← {t.navbar.home}
				</a>
			</div>
		);
	}

	const post = postQuery.data;

	return (
		<div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
			<h1 className='mb-8 text-3xl font-bold tracking-tight text-foreground'>
				{t.editor.editPost}
			</h1>

			<EditPostForm
				initialValues={{
					postId: post.id,
					title: post.title,
					slug: post.slug,
					lang: post.lang,
					description: post.description,
					content: post.content,
					categoryId: post.categoryId,
					tagIds: post.tagIds,
					featuredImage: post.featuredImage,
					status: post.status,
					publishedAt: post.publishedAt,
				}}
				onSubmit={(value) => updateMutation.mutate(value)}
				onSaveAndPublish={async (value) => {
					try {
						await updateMutation.mutateAsync(value);
						publishMutation.mutate();
					} catch {
						// onError already handled the toast
					}
				}}
				onUnpublish={() => unpublishMutation.mutate()}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
