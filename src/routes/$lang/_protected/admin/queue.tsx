import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Container } from "~/components/shared/Container";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { useI18n } from "~/shared/providers/i18n";
import { approvePostFn, rejectPostFn } from "~/shared/services/admin";
import { pendingPostsOptions } from "~/shared/tanstackQueries/admin";

export const Route = createFileRoute("/$lang/_protected/admin/queue")({
	head: () => ({
		meta: [
			{ title: "Admin - Approval Queue" },
			{ name: "description", content: "Review and approve pending posts" },
		],
	}),
	component: QueuePage,
});

function QueuePage() {
	const { data: posts = [] } = useQuery(pendingPostsOptions());
	const queryClient = useQueryClient();
	const { t } = useI18n();
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [rejectPostId, setRejectPostId] = useState<string | null>(null);
	const [rejectFeedback, setRejectFeedback] = useState("");

	const approveMutation = useMutation({
		mutationFn: (postId: string) => approvePostFn({ data: { postId } }),
		onSuccess: () => {
			toast.success("Post approved and published.");
			queryClient.invalidateQueries({ queryKey: ["admin", "pending-posts"] });
		},
		onError: () => toast.error("Failed to approve post."),
	});

	const rejectMutation = useMutation({
		mutationFn: ({ postId, feedback }: { postId: string; feedback: string }) =>
			rejectPostFn({ data: { postId, feedback } }),
		onSuccess: () => {
			toast.success("Post rejected. Feedback sent to author.");
			setRejectDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ["admin", "pending-posts"] });
		},
		onError: () => toast.error("Failed to reject post."),
	});

	const handleRejectClick = (postId: string) => {
		setRejectPostId(postId);
		setRejectFeedback("");
		setRejectDialogOpen(true);
	};

	const handleRejectSubmit = () => {
		if (!rejectPostId || !rejectFeedback.trim()) return;
		rejectMutation.mutate({ postId: rejectPostId, feedback: rejectFeedback.trim() });
	};

	const isProcessing = approveMutation.isPending || rejectMutation.isPending;

	return (
		<Container className="mt-16 sm:mt-32">
			<header className="max-w-2xl">
				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Approval Queue
				</h1>
				<p className="mt-6 text-base text-muted-foreground">
					Review and approve posts submitted by authors
				</p>
			</header>

			<div className="mt-16 sm:mt-20">
				{posts.length === 0 ? (
					<div className="rounded-2xl border border-border bg-muted/50 p-8 text-center">
						<p className="text-muted-foreground">
							No pending posts to review
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-6">
						{posts.map((post) => (
							<div
								key={post.id}
								className="rounded-2xl border border-border p-6"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<h3 className="text-xl font-semibold text-foreground">
											{post.title}
										</h3>
										<p className="mt-2 text-sm text-muted-foreground">
											{post.description}
										</p>
										<div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
											<span>
												{post.author?.firstName} {post.author?.lastName}
											</span>
											<Badge variant="outline">{post.lang.toUpperCase()}</Badge>
											<span className="font-mono text-xs">/{post.slug}</span>
											{post.category && (
												<Badge variant="secondary">{post.category.name}</Badge>
											)}
										</div>
										<div className="mt-2 text-xs text-muted-foreground">
											Submitted: {new Date(post.createdAt).toLocaleString()}
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleRejectClick(post.id)}
											disabled={isProcessing}
										>
											{t.common.reject}
										</Button>
										<Button
											size="sm"
											onClick={() => approveMutation.mutate(post.id)}
											disabled={isProcessing}
										>
											{t.common.approve}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Reject Feedback Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Post</DialogTitle>
						<DialogDescription>
							Provide feedback to the author explaining why this post was rejected.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-4 flex flex-col gap-4">
						<Textarea
							value={rejectFeedback}
							onChange={(e) => setRejectFeedback(e.target.value)}
							placeholder="Enter feedback for the author..."
							rows={4}
						/>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => setRejectDialogOpen(false)}
							>
								{t.common.cancel}
							</Button>
							<Button
								variant="destructive"
								onClick={handleRejectSubmit}
								disabled={!rejectFeedback.trim() || rejectMutation.isPending}
							>
								{t.common.reject}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Container>
	);
}
