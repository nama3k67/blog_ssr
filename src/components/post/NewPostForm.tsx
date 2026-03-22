import { useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { FormInput } from "~/components/form/FormInput";
import { FormSelect } from "~/components/form/FormSelect";
import { FormTextarea } from "~/components/form/FormTextarea";
import { FormField } from "~/components/form/FormField";
import { MarkdownEditor } from "~/components/post/MarkdownEditor";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { languageNames, languages } from "~/shared/constants/i18n";
import { cn } from "~/shared/lib/utils";
import { useI18n } from "~/shared/providers/i18n";
import {
	createPostFormSchema,
	type CreatePostFormInput,
} from "~/shared/schemas/post";
import {
	categoriesOptions,
	slugCheckOptions,
	tagsOptions,
} from "~/shared/tanstackQueries/post";
import { generateSlug } from "~/shared/utils/slug";

interface NewPostFormProps {
	lang: string;
	onSubmit: (value: CreatePostFormInput & { published: boolean }) => void;
	isSubmitting: boolean;
}

export function NewPostForm({ lang, onSubmit, isSubmitting }: NewPostFormProps) {
	const { t } = useI18n();

	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

	const { data: categories = [] } = useQuery(categoriesOptions());
	const { data: tags = [] } = useQuery(tagsOptions());

	const form = useForm({
		defaultValues: {
			title: "",
			slug: "",
			lang,
			description: "",
			content: "",
			categoryId: undefined as string | undefined,
			tagIds: [] as string[],
		},
		validators: {
			onSubmit: createPostFormSchema,
		},
		onSubmitMeta: {
			publish: false,
		},
		onSubmit: ({ value, meta }) => {
			if (isTaken) {
				toast.error(t.editor.slugTaken);
				return;
			}

			onSubmit({ ...value, published: meta.publish });
		},
	});

	const currentSlug = form.state.values.slug;
	const { data: slugData, isFetching: isCheckingSlug } = useQuery({
		...slugCheckOptions(currentSlug, lang),
		enabled: slugManuallyEdited && !!currentSlug && !currentSlug.includes(" "),
	});

	const isAvailable = !isCheckingSlug && slugData?.available === true;
	const isTaken = !isCheckingSlug && slugData?.available === false;

	const slugError = isTaken ? t.editor.slugTaken : undefined;

	const handleTitleChange = (value: string) => {
		if (!slugManuallyEdited && value) {
			form.setFieldValue("slug", generateSlug(value));
		}
	};

	const handleSlugChange = (value: string) => {
		setSlugManuallyEdited(true);
		form.setFieldValue("slug", value);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit({ publish: true });
			}}
		>
			<div className="flex flex-col gap-6">
				<div className="grid gap-6 sm:grid-cols-[1fr_160px]">
					<form.Field
						name="title"
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
								onValueChange={handleTitleChange}
							/>
						)}
					</form.Field>

					<form.Field name="lang">
						{(field) => (
							<FormSelect
								field={field}
								label={t.editor.language}
								options={languages.map((language) => ({
									value: language,
									label: languageNames[language],
								}))}
							/>
						)}
					</form.Field>
				</div>

				<form.Field name="slug">
					{(field) => (
						<Field data-invalid={!!slugError || undefined}>
							<FieldLabel htmlFor="slug">
								{t.editor.slug}
								{isCheckingSlug && (
									<span className="text-xs text-muted-foreground">
										{t.common.loading}
									</span>
								)}
								{isAvailable && (
									<span className="text-xs text-green-600 dark:text-green-400">
										✓
									</span>
								)}
							</FieldLabel>
							<Input
								id="slug"
								value={field.state.value}
								onChange={(e) => handleSlugChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder={t.editor.slugPlaceholder}
								className="font-mono text-sm"
								aria-invalid={!!slugError || undefined}
							/>
							{slugError && <FieldError>{slugError}</FieldError>}
						</Field>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
						<FormTextarea
							field={field}
							label={t.editor.description}
							placeholder={t.editor.descriptionPlaceholder}
							rows={2}
						/>
					)}
				</form.Field>

				<form.Field name="categoryId">
					{(field) => (
						<FormSelect
							field={field}
							label="Category"
							placeholder="Select a category..."
							emptyLabel="No category"
							options={categories.map((category) => ({
								value: category.id,
								label: category.name,
							}))}
							description="Optional - group this post under a topic."
						/>
					)}
				</form.Field>

				<form.Field name="tagIds">
					{(field) => {
						const selectedTagIds = field.state.value;
						return (
							<Field>
								<FieldLabel>Tags</FieldLabel>
								<div className="flex flex-wrap gap-2">
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
									Optional - select up to 10 tags ({selectedTagIds.length}/10).
								</FieldDescription>
							</Field>
						);
					}}
				</form.Field>

				<form.Field
					name="content"
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

				<div className="flex items-center justify-end gap-3 border-t border-border pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							void form.handleSubmit({ publish: false });
						}}
						disabled={isSubmitting}
					>
						{isSubmitting ? t.editor.saving : t.editor.saveDraft}
					</Button>
					<Button type="submit" disabled={isSubmitting || isTaken}>
						{isSubmitting ? t.editor.publishing : t.editor.publish}
					</Button>
				</div>
			</div>
		</form>
	);
}
