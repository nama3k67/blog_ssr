import type { ReactNode } from "react";
import type { FormFieldMeta } from "~/components/form/form-field-meta";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";

interface FormFieldProps {
	/** TanStack Form field instance – only the `.state.meta` shape is needed */
	field: Pick<FormFieldMeta, "name" | "state">;
	label: string;
	description?: string;
	children: ReactNode;
}

/**
 * Reusable form field wrapper that bridges TanStack Form with shadcn Field components.
 * Handles label, description, validation error display, and data-invalid state.
 */
export function FormField({
	field,
	label,
	description,
	children,
}: FormFieldProps) {
	const hasError =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	return (
		<Field data-invalid={hasError || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			{children}
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
