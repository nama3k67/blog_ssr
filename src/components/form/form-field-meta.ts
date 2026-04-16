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
			isDirty: boolean;
			errors: unknown[];
		};
	};
	handleChange: (value: TValue) => void;
	handleBlur: () => void;
}

/**
 * Extracts a human-readable string from a TanStack Form ValidationError.
 *
 * Field-level validators return plain strings; form-level Standard Schema
 * (Zod) validators store raw issue objects with a `message` property.
 * `String(issueObject)` produces "[object Object]", so we unwrap here.
 */
export function fieldErrorMessage(err: unknown): string {
	if (typeof err === "string") return err;
	if (err !== null && typeof err === "object" && "message" in err) {
		return String((err as { message: unknown }).message);
	}
	return String(err);
}
