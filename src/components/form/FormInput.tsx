import type { ComponentProps } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

import type { FormFieldMeta } from "~/components/form/form-field-meta";

interface FormInputProps extends Omit<ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "id"> {
	field: FormFieldMeta<string>;
	label: string;
	description?: string;
	/** Called with the new value after the field is updated */
	onValueChange?: (value: string) => void;
}

export function FormInput({ field, label, description, onValueChange, ...inputProps }: FormInputProps) {
	const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;

	return (
		<Field data-invalid={hasError || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				value={field.state.value}
				onChange={(e) => {
					field.handleChange(e.target.value);
					onValueChange?.(e.target.value);
				}}
				onBlur={field.handleBlur}
				aria-invalid={hasError || undefined}
				{...inputProps}
			/>
			{description && !hasError && (
				<FieldDescription>{description}</FieldDescription>
			)}
			{hasError && (
				<FieldError>
					{field.state.meta.errors.map(String).join(", ")}
				</FieldError>
			)}
		</Field>
	);
}
