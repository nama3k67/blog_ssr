import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useI18n } from "~/shared/providers/i18n";

interface SlugFieldProps {
	value: string;
	onChange: (value: string) => void;
	onBlur: () => void;
	isChecking: boolean;
	isAvailable: boolean;
	error?: string;
}

export function SlugField({
	value,
	onChange,
	onBlur,
	isChecking,
	isAvailable,
	error,
}: SlugFieldProps) {
	const { t } = useI18n();

	return (
		<Field data-invalid={!!error || undefined}>
			<FieldLabel htmlFor='slug'>
				{t.editor.slug}
				{isChecking && (
					<span className='text-xs text-muted-foreground'>
						{t.common.loading}
					</span>
				)}
				{isAvailable && (
					<span className='text-xs text-green-600 dark:text-green-400'>✓</span>
				)}
			</FieldLabel>
			<Input
				id='slug'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				placeholder={t.editor.slugPlaceholder}
				className='font-mono text-sm'
				aria-invalid={!!error || undefined}
			/>
			{error && <FieldError>{error}</FieldError>}
		</Field>
	);
}
