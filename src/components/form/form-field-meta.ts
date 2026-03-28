/**
 * Minimal duck-typed interface for TanStack Form field instances.
 * Avoids importing the full FieldApi generic, which is intentionally verbose.
 */
export interface FormFieldMeta<TValue = string> {
	name: string;
	state: {
		value: TValue;
		meta: {
			isTouched: boolean;
			errors: unknown[];
		};
	};
	handleChange: (value: TValue) => void;
	handleBlur: () => void;
}
