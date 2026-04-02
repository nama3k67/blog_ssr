import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { FormField } from "~/components/form/FormField";
import { FormInput } from "~/components/form/FormInput";
import { FormSelect } from "~/components/form/FormSelect";
import { FormTextarea } from "~/components/form/FormTextarea";
import { MarkdownEditor } from "~/components/post/MarkdownEditor";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { cn } from "~/shared/lib/utils";
import { useI18n } from "~/shared/providers/i18n";
import {
	type UpdatePostFormInput,
	updatePostFormSchema,
} from "~/shared/schemas/post";
import {
	categoriesOptions,
	slugCheckOptions,
	tagsOptions,
} from "~/shared/tanstackQueries/post";

interface EditPostInitialValues {
	postId: string;
	title: string;
	slug: string;
	lang: string;
	description: string;
	content: string;
	categoryId: string | undefined;
	tagIds: string[];
	featuredImage: string;
	status: "draft" | "published";
	publishedAt: string | null;
}

interface EditPostFormProps {
	initialValues: EditPostInitialValues;
	onSubmit: (value: UpdatePostFormInput) => void;
	onSaveAndPublish: (value: UpdatePostFormInput) => void;
	onUnpublish: () => void;
	isSubmitting: boolean;
}

export function EditPostForm({
	initialValues,
	onSubmit,
	onSaveAndPublish,
	onUnpublish,
	isSubmitting,
}: EditPostFormProps) {
	const { t } = useI18n();
	const publishIntentRef = useRef(false);

	const { data: categories = [] } = useQuery(categoriesOptions());
	const { data: tags = [] } = useQuery(tagsOptions());

	const form = useForm({
		defaultValues: {
			postId: initialValues.postId,
			title: initialValues.title,
			slug: initialValues.slug,
			lang: initialValues.lang,
			description: initialValues.description,
			content: initialValues.content,
			categoryId: initialValues.categoryId,
			tagIds: initialValues.tagIds,
			featuredImage: initialValues.featuredImage,
		},
		validators: {
			onSubmit: updatePostFormSchema,
		},
		onSubmit: ({ value }) => {
			if (isTaken) return;
			const withPublish = publishIntentRef.current;
			publishIntentRef.current = false;
			const payload = { ...value, postId: initialValues.postId };
			if (withPublish) {
				onSaveAndPublish(payload);
			} else {
				onSubmit(payload);
			}
		},
	});

	const currentSlug = form.state.values.slug;
	const {
		data: slugData,
		isFetching: isCheckingSlug,
		isError: isSlugCheckError,
	} = useQuery({
		...slugCheckOptions(currentSlug, initialValues.lang, initialValues.postId),
		enabled: !!currentSlug && !currentSlug.includes(" "),
	});

	const isAvailable = !isCheckingSlug && slugData?.available === true;
	const isTaken = !isCheckingSlug && slugData?.available === false;

	const slugError = isTaken
		? t.editor.slugTaken
		: isSlugCheckError
			? t.editor.slugCheckFailed
			: undefined;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<div className='flex flex-col gap-6'>
				<div className='grid gap-6 sm:grid-cols-[1fr_160px]'>
					<form.Field
						name='title'
						validators={{
							onBlur: ({ value }) =>
								!value.trim() ? t.editor.titleRequired : undefined,
						}}
					>
						{(field) => (
							<FormInput
								field={field}
								label={t.editor.title}
								placeholder={t.editor.titlePlaceholder}
							/>
						)}
					</form.Field>

					{/* Lang field is read-only — lang cannot be changed on edit */}
					<Field>
						<FieldLabel>{t.editor.language}</FieldLabel>
						<Input
							value={initialValues.lang === "vi" ? "Vietnamese" : "English"}
							disabled
							readOnly
							className='cursor-not-allowed opacity-60'
						/>
					</Field>
				</div>

				<form.Field name='slug'>
					{(field) => (
						<Field data-invalid={!!slugError || undefined}>
							<FieldLabel htmlFor='slug'>
								{t.editor.slug}
								{isCheckingSlug && (
									<span className='text-xs text-muted-foreground'>
										{t.common.loading}
									</span>
								)}
								{isAvailable && (
									<span className='text-xs text-green-600 dark:text-green-400'>
										✓
									</span>
								)}
							</FieldLabel>
							<Input
								id='slug'
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder={t.editor.slugPlaceholder}
								className='font-mono text-sm'
								aria-invalid={!!slugError || undefined}
							/>
							{slugError && <FieldError>{slugError}</FieldError>}
						</Field>
					)}
				</form.Field>

				<form.Field name='description'>
					{(field) => (
						<FormTextarea
							field={field}
							label={t.editor.description}
							placeholder={t.editor.descriptionPlaceholder}
							rows={2}
						/>
					)}
				</form.Field>

				<form.Field name='categoryId'>
					{(field) => (
						<FormSelect
							field={field}
							label='Category'
							placeholder='Select a category...'
							emptyLabel='No category'
							options={categories.map((category) => ({
								value: category.id,
								label: category.name,
							}))}
							description='Optional - group this post under a topic.'
						/>
					)}
				</form.Field>

				<form.Field name='featuredImage'>
					{(field) => (
						<FormInput
							field={field}
							label={t.editor.featuredImage}
							placeholder='https://...'
						/>
					)}
				</form.Field>

				<form.Field name='tagIds'>
					{(field) => {
						const selectedTagIds = field.state.value;
						return (
							<Field>
								<FieldLabel>Tags</FieldLabel>
								<div className='flex flex-wrap gap-2'>
									{tags.map((tag) => {
										const isSelected = selectedTagIds.includes(tag.id);
										return (
											<Badge
												key={tag.id}
												variant={isSelected ? "default" : "outline"}
												className={cn(
													"cursor-pointer select-none transition-colors",
													isSelected && "bg-primary text-primary-foreground",
												)}
												onClick={() => {
													if (isSelected) {
														field.handleChange(
															selectedTagIds.filter((id) => id !== tag.id),
														);
													} else if (selectedTagIds.length < 10) {
														field.handleChange([...selectedTagIds, tag.id]);
													}
												}}
											>
												{isSelected && "✓ "}#{tag.name}
											</Badge>
										);
									})}
								</div>
							</Field>
						);
					}}
				</form.Field>

				<form.Field
					name='content'
					validators={{
						onBlur: ({ value }) =>
							value.trim() ? undefined : t.editor.contentRequired,
						onChange: ({ value }) =>
							value.trim() ? undefined : t.editor.contentRequired,
					}}
				>
					{(field) => (
						<FormField field={field} label={t.editor.content}>
							<MarkdownEditor
								value={field.state.value}
								onChange={(value) => field.handleChange(value)}
								placeholder={t.editor.contentPlaceholder}
								height={500}
							/>
						</FormField>
					)}
				</form.Field>

				<div className='flex items-center justify-between gap-3 border-t border-border pt-6'>
					<div className='flex gap-3'>
						{initialValues.status === "published" && (
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
						{initialValues.status === "draft" && (
							<Button
								type='button'
								onClick={() => {
									publishIntentRef.current = true;
									void form.handleSubmit();
								}}
								disabled={
									isSubmitting || isTaken || isCheckingSlug || isSlugCheckError
								}
							>
								{isSubmitting ? t.editor.publishing : t.editor.publish}
							</Button>
						)}
						<Button
							type='button'
							variant='outline'
							onClick={() => void form.handleSubmit()}
							disabled={
								isSubmitting || isTaken || isCheckingSlug || isSlugCheckError
							}
						>
							{isSubmitting ? t.editor.saving : t.editor.saveChanges}
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
