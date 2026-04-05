import { Link } from "@tanstack/react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { EnDict } from "~/locales/en";
import type { AdminPost } from "./types";

interface PostRowProps {
	post: AdminPost;
	lang: string;
	isProcessing: boolean;
	translationLabel: string;
	translationPartnerId: string | null;
	formatDate: (iso: string) => string;
	onPublish: (postId: string) => void;
	onUnpublish: (postId: string) => void;
	onDeleteClick: (id: string, title: string) => void;
	t: EnDict;
}

export function computeTranslationStatus(
	posts: AdminPost[],
	translationGroupId: string,
	lang: string,
	t: EnDict,
): { label: string; partnerId: string | null } {
	const groupLangs = posts
		.filter((p) => p.translationGroupId === translationGroupId)
		.map((p) => p.lang);

	const label =
		groupLangs.includes("en") && groupLangs.includes("vi")
			? t.translation.enAndVi
			: groupLangs.includes("en")
				? t.translation.enOnly
				: t.translation.viOnly;

	const partner = posts.find(
		(p) => p.translationGroupId === translationGroupId && p.lang !== lang,
	);
	return { label, partnerId: partner?.id ?? null };
}

export function PostRow({
	post,
	lang,
	isProcessing,
	translationLabel,
	translationPartnerId,
	formatDate,
	onPublish,
	onUnpublish,
	onDeleteClick,
	t,
}: PostRowProps) {
	return (
		<div className='rounded-2xl border border-zinc-100 p-5 dark:border-zinc-700/40'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				{/* Post info */}
				<div className='min-w-0 flex-1'>
					<div className='flex flex-wrap items-center gap-2'>
						<span className='truncate text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100'>
							{post.title}
						</span>
						<Badge variant='outline' className='shrink-0'>
							{post.lang.toUpperCase()}
						</Badge>
						<Badge
							variant={post.status === "published" ? "default" : "secondary"}
							className='shrink-0'
						>
							{post.status === "published"
								? t.admin.statusPublished
								: t.admin.statusDraft}
						</Badge>
						{post.category && (
							<Badge variant='outline' className='shrink-0 text-xs'>
								{post.category.name}
							</Badge>
						)}
					</div>
					<div className='mt-1 flex flex-wrap gap-3 text-xs text-zinc-400 dark:text-zinc-500'>
						<span className='font-mono'>/{post.slug}</span>
						{post.publishedAt && (
							<span>
								{t.admin.publishedOn} {formatDate(post.publishedAt)}
							</span>
						)}
						<span>
							{t.admin.createdOn} {formatDate(post.createdAt)}
						</span>
						{translationPartnerId ? (
							<Link
								to='/$lang/edit/$postId'
								params={{ lang, postId: translationPartnerId }}
								className='font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300'
							>
								{translationLabel}
							</Link>
						) : (
							<span className='text-zinc-400 dark:text-zinc-500'>
								{translationLabel}
							</span>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className='flex shrink-0 flex-wrap items-center gap-2'>
					<Link to='/$lang/edit/$postId' params={{ lang, postId: post.id }}>
						<Button size='sm' variant='outline' disabled={isProcessing}>
							{t.common.edit}
						</Button>
					</Link>
					{post.status === "draft" ? (
						<Button
							size='sm'
							variant='outline'
							onClick={() => onPublish(post.id)}
							disabled={isProcessing}
						>
							{t.editor.publish}
						</Button>
					) : (
						<Button
							size='sm'
							variant='outline'
							onClick={() => onUnpublish(post.id)}
							disabled={isProcessing}
						>
							{t.editor.unpublish}
						</Button>
					)}
					<Button
						size='sm'
						variant='destructive'
						onClick={() => onDeleteClick(post.id, post.title)}
						disabled={isProcessing}
					>
						{t.common.delete}
					</Button>
				</div>
			</div>
		</div>
	);
}
