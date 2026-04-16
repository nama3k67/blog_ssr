import type { ComponentProps } from "react";
import {
	type FormFieldMeta,
	fieldErrorMessage,
} from "~/components/form/form-field-meta";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { Textarea } from "~/components/ui/textarea";

interface FormTextareaProps
	extends Omit<
		ComponentProps<typeof Textarea>,
		"value" | "onChange" | "onBlur"
	> {
	field: FormFieldMeta<string>;
	label: string;
	description?: string;
}

export function FormTextarea({
	field,
	label,
	description,
	...textareaProps
}: FormTextareaProps) {
	const hasError =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	return (
		<Field data-invalid={hasError || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Textarea
				id={field.name}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				aria-invalid={hasError || undefined}
				{...textareaProps}
			/>
			{description && !hasError && (
				<FieldDescription>{description}</FieldDescription>
			)}
			{hasError && (
				<FieldError>
					{[...new Set(field.state.meta.errors.map(fieldErrorMessage))].join(
						", ",
					)}
				</FieldError>
			)}
		</Field>
	);
}
