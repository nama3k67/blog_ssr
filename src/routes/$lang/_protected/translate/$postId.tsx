import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { NewTranslationForm } from "~/components/post/NewTranslationForm";
import { useI18n } from "~/shared/providers/i18n";
import { browserQueryClient } from "~/shared/providers/tanstackQuery";
import type { CreateTranslationInput } from "~/shared/schemas/post";
import { checkAdmin } from "~/shared/services/admin";
import { createTranslationFn } from "~/shared/services/post";
import {
	categoriesOptions,
	postForEditOptions,
	tagsOptions,
} from "~/shared/tanstackQueries/post";

export const Route = createFileRoute("/$lang/_protected/translate/$postId")({
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
	component: TranslatePage,
});

function TranslatePage() {
	const { t } = useI18n();
	const { lang, postId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const postQuery = useQuery(postForEditOptions(postId));
	const post = postQuery.data;

	const createMutation = useMutation({
		mutationFn: (input: CreateTranslationInput) =>
			createTranslationFn({ data: input }),
		onSuccess: (result) => {
			toast.success(t.translation.createSuccess);
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
			navigate({
				to: "/$lang/edit/$postId",
				params: { lang, postId: result.id },
			});
		},
		onError: (err) => {
			const raw = err instanceof Error ? err.message : "";
			const message = raw.includes("TRANSLATION_EXISTS")
				? t.translation.alreadyExists
				: raw.includes("POST_NOT_FOUND")
					? t.editor.postNotFound
					: t.translation.createError;
			toast.error(message);
		},
	});

	if (postQuery.isLoading) {
		return (
			<div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
				<p className='text-zinc-600 dark:text-zinc-400'>{t.common.loading}</p>
			</div>
		);
	}

	if (!post) {
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

	const targetLang = post.lang === "en" ? "vi" : "en";

	return (
		<div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
			<h1 className='mb-2 text-3xl font-bold tracking-tight text-foreground'>
				{t.translation.createTranslation}
			</h1>
			<p className='mb-8 text-sm text-zinc-500 dark:text-zinc-400'>
				/{post.slug} → {targetLang.toUpperCase()}
			</p>

			<NewTranslationForm
				initialValues={{
					originalPostId: post.id,
					slug: post.slug,
					targetLang,
					categoryId: post.categoryId,
					tagIds: post.tagIds,
				}}
				onSubmit={(value: CreateTranslationInput) =>
					createMutation.mutate(value)
				}
				isSubmitting={createMutation.isPending}
			/>
		</div>
	);
}
