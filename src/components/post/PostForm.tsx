import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { FormField } from "~/components/form/FormField";
import { FormInput } from "~/components/form/FormInput";
import { FormSelect } from "~/components/form/FormSelect";
import { FormTextarea } from "~/components/form/FormTextarea";
import { PostFormFooter } from "~/components/post/fields/PostFormFooter";
import { SlugField } from "~/components/post/fields/SlugField";
import { TagsField } from "~/components/post/fields/TagsField";
import { MarkdownEditor } from "~/components/post/MarkdownEditor";
import { Field, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { languageNames, languages } from "~/shared/constants/i18n";
import { useI18n } from "~/shared/providers/i18n";
import type {
	CreatePostFormInput,
	PostFormValues,
	UpdatePostFormInput,
} from "~/shared/schemas/post";
import { postFormSchema } from "~/shared/schemas/post";
import {
	categoriesOptions,
	slugCheckOptions,
	tagsOptions,
} from "~/shared/tanstackQueries/post";
import { generateSlug } from "~/shared/utils/slug";

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
}

type PostFormProps =
	| {
			mode: "create";
			lang: string;
			onSubmit: (value: CreatePostFormInput & { published: boolean }) => void;
			isSubmitting: boolean;
	  }
	| {
			mode: "edit";
			initialValues: EditPostInitialValues;
			onSubmit: (value: UpdatePostFormInput) => void;
			onSaveAndPublish: (value: UpdatePostFormInput) => void;
			onUnpublish: () => void;
			isSubmitting: boolean;
	  };

export type { EditPostInitialValues };

export function PostForm(props: PostFormProps) {
	const { t } = useI18n();
	const isCreate = props.mode === "create";
	const lang = isCreate ? props.lang : props.initialValues.lang;

	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

	const { data: categories = [] } = useQuery(categoriesOptions());
	const { data: tags = [] } = useQuery(tagsOptions());

	const form = useForm({
		defaultValues: isCreate
			? {
					title: "",
					slug: "",
					lang,
					description: "",
					content: "",
					categoryId: undefined as string | undefined,
					tagIds: [] as string[],
					postId: "",
					featuredImage: "",
				}
			: {
					title: props.initialValues.title,
					slug: props.initialValues.slug,
					lang: props.initialValues.lang,
					description: props.initialValues.description,
					content: props.initialValues.content,
					categoryId: props.initialValues.categoryId,
					tagIds: props.initialValues.tagIds,
					postId: props.initialValues.postId,
					featuredImage: props.initialValues.featuredImage,
				},
		validators: {
			onSubmit: postFormSchema,
		},
		onSubmitMeta: {} as { publish: boolean },
		onSubmit: ({
			value,
			meta,
		}: {
			value: PostFormValues;
			meta: { publish: boolean };
		}) => {
			if (isTaken) {
				toast.error(t.editor.slugTaken);
				return;
			}

			if (props.mode === "create") {
				props.onSubmit({
					title: value.title,
					slug: value.slug,
					lang: value.lang,
					description: value.description,
					content: value.content,
					categoryId: value.categoryId,
					tagIds: value.tagIds,
					published: meta.publish,
				});
			} else if (meta.publish) {
				props.onSaveAndPublish(value);
			} else {
				props.onSubmit(value);
			}
		},
	});

	const currentSlug = form.state.values.slug;
	const excludePostId = isCreate ? undefined : props.initialValues.postId;
	const slugCheckEnabled = isCreate
		? slugManuallyEdited && !!currentSlug
		: !!currentSlug;

	const {
		data: slugData,
		isFetching: isCheckingSlug,
		isError: isSlugCheckError,
	} = useQuery({
		...slugCheckOptions(currentSlug, lang, excludePostId),
		enabled: slugCheckEnabled && !currentSlug.includes(" "),
	});

	const isAvailable = !isCheckingSlug && slugData?.available === true;
	const isTaken = !isCheckingSlug && slugData?.available === false;

	const slugError = isTaken
		? t.editor.slugTaken
		: isSlugCheckError
			? t.editor.slugCheckFailed
			: undefined;

	const isActionDisabled =
		props.isSubmitting || isTaken || isCheckingSlug || isSlugCheckError;

	const handleTitleChange = (value: string) => {
		if (isCreate && !slugManuallyEdited && value) {
			form.setFieldValue("slug", generateSlug(value));
		}
	};

	const handleSlugChange = (value: string) => {
		if (isCreate) setSlugManuallyEdited(true);
		form.setFieldValue("slug", value);
	};

	const handleSubmit = (publish: boolean) => {
		void form.handleSubmit({ publish });
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<div className='flex flex-col gap-6'>
				<div className='grid gap-6 sm:grid-cols-[1fr_160px]'>
					<form.Field
						name='title'
						validators={{
							onBlur: ({ value, fieldApi }) =>
								fieldApi.state.meta.isDirty && !value.trim()
									? t.editor.titleRequired
									: undefined,
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

					{isCreate ? (
						<form.Field name='lang'>
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
					) : (
						<Field>
							<FieldLabel>{t.editor.language}</FieldLabel>
							<Input
								value={lang === "vi" ? "Vietnamese" : "English"}
								disabled
								readOnly
								className='cursor-not-allowed opacity-60'
							/>
						</Field>
					)}
				</div>

				<div className='grid gap-6 sm:grid-cols-[1fr_160px]'>
					<form.Field name='slug'>
						{(field) => (
							<SlugField
								value={field.state.value}
								onChange={handleSlugChange}
								onBlur={field.handleBlur}
								isChecking={isCheckingSlug}
								isAvailable={isAvailable}
								error={slugError}
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
							/>
						)}
					</form.Field>
				</div>

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

				{!isCreate && (
					<form.Field name='featuredImage'>
						{(field) => (
							<FormInput
								field={field}
								label={t.editor.featuredImage}
								placeholder='https://...'
							/>
						)}
					</form.Field>
				)}

				<form.Field name='tagIds'>
					{(field) => (
						<TagsField
							label={t.editor.tags}
							selectedIds={field.state.value}
							onChange={(ids) => field.handleChange(ids)}
							tags={tags}
							description={`Optional - select up to 10 tags (${field.state.value.length}/10).`}
						/>
					)}
				</form.Field>

				<form.Field
					name='content'
					validators={{
						onBlur: ({ value, fieldApi }) =>
							fieldApi.state.meta.isDirty && !value.trim()
								? t.editor.contentRequired
								: undefined,
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

				<PostFormFooter
					mode={props.mode}
					status={isCreate ? undefined : props.initialValues.status}
					isSubmitting={props.isSubmitting}
					isSubmitDisabled={isActionDisabled}
					onSaveDraft={() => handleSubmit(false)}
					onPublish={() => handleSubmit(true)}
					onUnpublish={isCreate ? undefined : props.onUnpublish}
				/>
			</div>
		</form>
	);
}
