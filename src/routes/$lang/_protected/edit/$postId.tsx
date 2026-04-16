import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { toast } from "sonner";

import { PostForm } from "~/components/post/PostForm";
import { useI18n } from "~/shared/providers/i18n";
import { browserQueryClient } from "~/shared/providers/tanstackQuery";
import type { UpdatePostFormInput } from "~/shared/schemas/post";
import { checkAdmin, unpublishPostFn } from "~/shared/services/admin";
import { publishPostFn, updatePostFn } from "~/shared/services/post";
import {
	categoriesOptions,
	postForEditOptions,
	tagsOptions,
	translationCheckOptions,
} from "~/shared/tanstackQueries/post";

export const Route = createFileRoute("/$lang/_protected/edit/$postId")({
	beforeLoad: async ({ params }) => {
		try {
			return await checkAdmin();
		} catch {
			throw redirect({
				to: "/$lang",
				params: { lang: params.lang },
			});
		}
	},
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
	const post = postQuery.data;
	const targetLang = post ? (post.lang === "en" ? "vi" : "en") : "vi";
	const translationQuery = useQuery({
		...translationCheckOptions(post?.translationGroupId ?? "", targetLang),
		enabled: !!post?.translationGroupId,
	});

	const updateMutation = useMutation({
		mutationFn: (input: UpdatePostFormInput) => updatePostFn({ data: input }),
		onSuccess: () => {
			toast.success(t.editor.updated);
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
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
			queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
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
			queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
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

	if (!post) return null;

	return (
		<div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
			<h1 className='mb-8 text-3xl font-bold tracking-tight text-foreground'>
				{t.editor.editPost}
			</h1>

			<PostForm
				mode='edit'
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

			{/* Translation Management Section */}
			<div className='mt-8 rounded-2xl border border-zinc-100 p-5 dark:border-zinc-700/40'>
				<p className='text-sm font-semibold text-zinc-800 dark:text-zinc-100'>
					{t.translation.translationStatus}
				</p>
				{translationQuery.isLoading ? (
					<p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
						{t.common.loading}
					</p>
				) : translationQuery.data?.exists ? (
					<div className='mt-2'>
						<p className='text-sm text-zinc-600 dark:text-zinc-400'>
							{targetLang.toUpperCase()} version exists.
						</p>
						<Link
							to='/$lang/edit/$postId'
							params={{ lang, postId: translationQuery.data.postId ?? "" }}
							className='mt-2 inline-block text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300'
						>
							{t.translation.editTranslation} →
						</Link>
					</div>
				) : (
					<div className='mt-2'>
						<p className='text-sm text-zinc-600 dark:text-zinc-400'>
							{t.translation.noTranslation}
						</p>
						<Link
							to='/$lang/translate/$postId'
							params={{ lang, postId: post.id }}
							className='mt-2 inline-block text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300'
						>
							{t.translation.createTranslation} →
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
