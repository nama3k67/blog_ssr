import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { FilterBar } from "~/components/admin/FilterBar";
import { computeTranslationStatus, PostRow } from "~/components/admin/PostRow";
import type { LangFilter, StatusFilter } from "~/components/admin/types";
import { Container } from "~/components/shared/Container";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { useI18n } from "~/shared/providers/i18n";
import { browserQueryClient } from "~/shared/providers/tanstackQuery";
import { deletePostFn, unpublishPostFn } from "~/shared/services/admin";
import { publishPostFn } from "~/shared/services/post";
import { adminPostsOptions } from "~/shared/tanstackQueries/admin";

export const Route = createFileRoute("/$lang/_protected/admin/queue")({
	loader: async () => {
		const qc = browserQueryClient;
		if (!qc) return;
		await qc.fetchQuery(adminPostsOptions()); // always fetches, bypasses cache
	},
	head: () => ({
		meta: [
			{ title: "Admin - Post Dashboard" },
			{ name: "description", content: "Manage all posts" },
		],
	}),
	component: PostDashboardPage,
});

function PostDashboardPage() {
	const { t } = useI18n();
	const { lang } = Route.useParams();
	const queryClient = useQueryClient();

	const { data: posts = [], isLoading } = useQuery(adminPostsOptions());

	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [langFilter, setLangFilter] = useState<LangFilter>("all");

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<{
		id: string;
		title: string;
	} | null>(null);

	const invalidateAll = () => {
		queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
		queryClient.invalidateQueries({ queryKey: ["posts"] });
	};

	const publishMutation = useMutation({
		mutationFn: (postId: string) => publishPostFn({ data: { postId } }),
		onSuccess: () => {
			toast.success(t.admin.publishSuccess);
			invalidateAll();
		},
		onError: () => toast.error(t.admin.publishError),
	});

	const unpublishMutation = useMutation({
		mutationFn: (postId: string) => unpublishPostFn({ data: { postId } }),
		onSuccess: () => {
			toast.success(t.admin.unpublishSuccess);
			invalidateAll();
		},
		onError: () => toast.error(t.admin.unpublishError),
	});

	const deleteMutation = useMutation({
		mutationFn: (postId: string) => deletePostFn({ data: { postId } }),
		onSuccess: () => {
			toast.success(t.admin.deleteSuccess);
			setDeleteDialogOpen(false);
			setPendingDelete(null);
			invalidateAll();
		},
		onError: () => toast.error(t.admin.deleteError),
	});

	const filtered = posts
		.filter((p) => statusFilter === "all" || p.status === statusFilter)
		.filter((p) => langFilter === "all" || p.lang === langFilter);

	const isProcessing =
		publishMutation.isPending ||
		unpublishMutation.isPending ||
		deleteMutation.isPending;

	const handleDeleteClick = (id: string, title: string) => {
		setPendingDelete({ id, title });
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!pendingDelete) return;
		deleteMutation.mutate(pendingDelete.id);
	};

	const formatDate = (iso: string) =>
		new Date(iso).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	return (
		<Container className='mt-16 sm:mt-32'>
			<header className='max-w-2xl'>
				<h1 className='text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl'>
					{t.admin.dashboard}
				</h1>
				<p className='mt-6 text-base text-zinc-600 dark:text-zinc-400'>
					{t.admin.dashboardDescription}
				</p>
			</header>

			<FilterBar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				langFilter={langFilter}
				setLangFilter={setLangFilter}
				t={t}
			/>

			<div className='mt-8 sm:mt-10'>
				{isLoading ? (
					<p className='text-zinc-500 dark:text-zinc-400'>{t.common.loading}</p>
				) : filtered.length === 0 ? (
					<div className='rounded-2xl border border-zinc-100 bg-zinc-50/50 p-8 text-center dark:border-zinc-700/40 dark:bg-zinc-800/50'>
						<p className='text-zinc-500 dark:text-zinc-400'>
							{t.admin.noPosts}
						</p>
					</div>
				) : (
					<div className='flex flex-col gap-4'>
						{filtered.map((post) => {
							const { label, partnerId } = computeTranslationStatus(
								posts,
								post.translationGroupId,
								post.lang,
								t,
							);
							return (
								<PostRow
									key={post.id}
									post={post}
									lang={lang}
									isProcessing={isProcessing}
									translationLabel={label}
									translationPartnerId={partnerId}
									formatDate={formatDate}
									onPublish={publishMutation.mutate}
									onUnpublish={unpublishMutation.mutate}
									onDeleteClick={handleDeleteClick}
									t={t}
								/>
							);
						})}
					</div>
				)}
			</div>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.admin.deleteConfirmTitle}</DialogTitle>
						<DialogDescription>
							{t.admin.deleteConfirmBody.replace(
								"{title}",
								pendingDelete?.title ?? "",
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setDeleteDialogOpen(false);
								setPendingDelete(null);
							}}
						>
							{t.common.cancel}
						</Button>
						<Button
							variant='destructive'
							onClick={handleDeleteConfirm}
							disabled={deleteMutation.isPending}
						>
							{t.common.delete}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Container>
	);
}
