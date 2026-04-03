import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { FormField } from "~/components/form/FormField";
import { FormInput } from "~/components/form/FormInput";
import { FormSelect } from "~/components/form/FormSelect";
import { FormTextarea } from "~/components/form/FormTextarea";
import { MarkdownEditor } from "~/components/post/MarkdownEditor";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { cn } from "~/shared/lib/utils";
import { useI18n } from "~/shared/providers/i18n";
import {
	type CreateTranslationInput,
	createTranslationFormSchema,
} from "~/shared/schemas/post";
import { categoriesOptions, tagsOptions } from "~/shared/tanstackQueries/post";

interface TranslationInitialValues {
	originalPostId: string;
	slug: string;
	targetLang: string;
	categoryId: string | undefined;
	tagIds: string[];
}

interface NewTranslationFormProps {
	initialValues: TranslationInitialValues;
	onSubmit: (value: CreateTranslationInput) => void;
	isSubmitting: boolean;
}

export function NewTranslationForm({
	initialValues,
	onSubmit,
	isSubmitting,
}: NewTranslationFormProps) {
	const { t } = useI18n();

	const { data: categories = [] } = useQuery(categoriesOptions());
	const { data: tags = [] } = useQuery(tagsOptions());

	const form = useForm({
		defaultValues: {
			originalPostId: initialValues.originalPostId,
			title: "",
			slug: initialValues.slug,
			lang: initialValues.targetLang,
			description: "",
			content: "",
			categoryId: initialValues.categoryId,
			tagIds: initialValues.tagIds,
			featuredImage: "",
		},
		validators: {
			onSubmit: createTranslationFormSchema,
		},
		onSubmit: ({ value }) => {
			onSubmit({
				originalPostId: value.originalPostId,
				title: value.title,
				content: value.content,
				description: value.description || undefined,
				featuredImage: value.featuredImage || undefined,
				categoryId: value.categoryId,
				tagIds: value.tagIds,
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<div className='flex flex-col gap-6'>
				{/* Language (read-only) and Slug (read-only) info */}
				<div className='grid gap-6 sm:grid-cols-2'>
					<div>
						<p className='text-sm font-medium text-zinc-800 dark:text-zinc-100'>
							{t.translation.targetLang}
						</p>
						<p className='mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400'>
							{initialValues.targetLang.toUpperCase()}
						</p>
					</div>
					<div>
						<p className='text-sm font-medium text-zinc-800 dark:text-zinc-100'>
							{t.editor.slug}
						</p>
						<p className='mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400'>
							/{initialValues.slug}
						</p>
					</div>
				</div>

				{/* Hidden fields for form submission */}
				<input
					type='hidden'
					name='originalPostId'
					value={initialValues.originalPostId}
				/>
				<input type='hidden' name='slug' value={initialValues.slug} />
				<input type='hidden' name='lang' value={initialValues.targetLang} />

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
							label={t.editor.category}
							placeholder={t.editor.categoryPlaceholder}
							emptyLabel={t.editor.categoryEmpty}
							options={categories.map((category) => ({
								value: category.id,
								label: category.name,
							}))}
							description={t.editor.categoryHint}
						/>
					)}
				</form.Field>

				<form.Field name='tagIds'>
					{(field) => {
						const selectedTagIds = field.state.value;
						return (
							<Field>
								<FieldLabel>{t.editor.tags}</FieldLabel>
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
								<FieldDescription>
									{t.editor.tagsHint} ({selectedTagIds.length}/10)
								</FieldDescription>
							</Field>
						);
					}}
				</form.Field>

				<form.Field name='featuredImage'>
					{(field) => (
						<div>
							<label
								htmlFor='featured-image'
								className='text-sm font-medium text-zinc-800 dark:text-zinc-100'
							>
								{t.editor.featuredImage}
							</label>
							<Input
								id='featured-image'
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder='https://...'
								className='mt-1.5'
							/>
						</div>
					)}
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

				<div className='flex items-center justify-end gap-3 border-t border-border pt-6'>
					<Button type='submit' disabled={isSubmitting}>
						{isSubmitting ? t.editor.saving : t.translation.createTranslation}
					</Button>
				</div>
			</div>
		</form>
	);
}
