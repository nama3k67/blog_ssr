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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

interface SelectOption {
	value: string;
	label: string;
}

interface FormSelectProps {
	field: FormFieldMeta<string> | FormFieldMeta<string | undefined>;
	label: string;
	description?: string;
	placeholder?: string;
	options: SelectOption[];
	/** When provided, adds a "none" option that sets the value to undefined */
	emptyLabel?: string;
}

export function FormSelect({
	field,
	label,
	description,
	placeholder,
	options,
	emptyLabel,
}: FormSelectProps) {
	const hasError =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	return (
		<Field data-invalid={hasError || undefined}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Select
				value={field.state.value ?? "none"}
				onValueChange={(val) => {
					const newValue = emptyLabel && val === "none" ? undefined : val;
					(field as FormFieldMeta<string | undefined>).handleChange(newValue);
				}}
			>
				<SelectTrigger id={field.name}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{emptyLabel && <SelectItem value='none'>{emptyLabel}</SelectItem>}
					{options.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
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
