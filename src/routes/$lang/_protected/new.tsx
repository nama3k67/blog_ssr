import { auth } from "@clerk/tanstack-react-start/server";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { NewPostForm } from "~/components/post/NewPostForm";
import { isAdmin } from "~/env";
import { dictionaries } from "~/locales";
import { useI18n } from "~/shared/providers/i18n";
import { browserQueryClient } from "~/shared/providers/tanstackQuery";
import type { CreatePostFormInput } from "~/shared/schemas/post";
import { checkAdmin } from "~/shared/services/admin";
import { createPostFn } from "~/shared/services/post";
import { categoriesOptions, tagsOptions } from "~/shared/tanstackQueries/post";

export const Route = createFileRoute("/$lang/_protected/new")({
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
	loader: () => {
		const qc = browserQueryClient;
		if (!qc) return;
		void Promise.all([
			qc.ensureQueryData(categoriesOptions()),
			qc.ensureQueryData(tagsOptions()),
		]);
	},
	head: ({ params }) => {
		const t = dictionaries[params.lang as keyof typeof dictionaries];
		return {
			meta: [
				{ title: t.common.newPost },
				{ name: "description", content: t.common.newPost },
			],
		};
	},
	component: NewPostPage,
});

function NewPostPage() {
	const { t } = useI18n();
	const { lang } = Route.useParams();
	const navigate = useNavigate();

	const createMutation = useMutation({
		mutationFn: (input: CreatePostFormInput & { published: boolean }) =>
			createPostFn({ data: input }),
		onSuccess: (post, variables) => {
			if (variables.published) {
				toast.success(t.editor.published);
				navigate({
					to: "/$lang/posts/$slug",
					params: { lang: variables.lang, slug: post.slug },
				});
				return;
			}

			toast.success(t.editor.draftSaved);
			navigate({
				to: "/$lang/edit/$postId",
				params: { lang: variables.lang, postId: post.id },
			});
		},
		onError: (err) => {
			const message =
				err instanceof Error && err.message === "SLUG_TAKEN"
					? t.editor.slugTaken
					: t.editor.errorSaving;
			toast.error(message);
		},
	});

	return (
		<div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
			<h1 className='mb-8 text-3xl font-bold tracking-tight text-foreground'>
				{t.common.newPost}
			</h1>

			<NewPostForm
				lang={lang}
				onSubmit={(value) => createMutation.mutate(value)}
				isSubmitting={createMutation.isPending}
			/>
		</div>
	);
}
