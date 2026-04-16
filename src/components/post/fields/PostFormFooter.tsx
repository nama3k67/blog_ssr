import { Button } from "~/components/ui/button";
import { useI18n } from "~/shared/providers/i18n";

interface PostFormFooterProps {
	mode: "create" | "edit";
	status?: "draft" | "published";
	isSubmitting: boolean;
	isSubmitDisabled: boolean;
	onSaveDraft: () => void;
	onPublish: () => void;
	onUnpublish?: () => void;
}

export function PostFormFooter({
	mode,
	status,
	isSubmitting,
	isSubmitDisabled,
	onSaveDraft,
	onPublish,
	onUnpublish,
}: PostFormFooterProps) {
	const { t } = useI18n();

	if (mode === "create") {
		return (
			<div className='flex items-center justify-end gap-3'>
				<Button
					type='button'
					variant='outline'
					onClick={onSaveDraft}
					disabled={isSubmitting}
				>
					{isSubmitting ? t.editor.saving : t.editor.saveDraft}
				</Button>
				<Button type='button' onClick={onPublish} disabled={isSubmitDisabled}>
					{isSubmitting ? t.editor.publishing : t.editor.publish}
				</Button>
			</div>
		);
	}

	return (
		<div className='flex items-center justify-between gap-3'>
			<div className='flex gap-3'>
				{status === "published" && onUnpublish && (
					<Button
						type='button'
						variant='outline'
						onClick={onUnpublish}
						disabled={isSubmitting}
					>
						{isSubmitting ? t.editor.unpublishing : t.editor.unpublish}
					</Button>
				)}
			</div>
			<div className='flex gap-3'>
				{status === "draft" && (
					<Button type='button' onClick={onPublish} disabled={isSubmitDisabled}>
						{isSubmitting ? t.editor.publishing : t.editor.publish}
					</Button>
				)}
				<Button
					type='button'
					variant='outline'
					onClick={onSaveDraft}
					disabled={isSubmitDisabled}
				>
					{isSubmitting ? t.editor.saving : t.editor.saveChanges}
				</Button>
			</div>
		</div>
	);
}
