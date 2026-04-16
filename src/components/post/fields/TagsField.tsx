import { Badge } from "~/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { cn } from "~/shared/lib/utils";

interface Tag {
	id: string;
	name: string;
}

interface TagsFieldProps {
	label: string;
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	tags: Tag[];
	maxTags?: number;
	description?: string;
}

export function TagsField({
	label,
	selectedIds,
	onChange,
	tags,
	maxTags = 10,
	description,
}: TagsFieldProps) {
	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			<fieldset className='flex flex-wrap gap-2' aria-label={label}>
				{tags.map((tag) => {
					const isSelected = selectedIds.includes(tag.id);
					return (
						<button
							key={tag.id}
							type='button'
							aria-pressed={isSelected}
							onClick={() => {
								if (isSelected) {
									onChange(selectedIds.filter((id) => id !== tag.id));
								} else if (selectedIds.length < maxTags) {
									onChange([...selectedIds, tag.id]);
								}
							}}
						>
							<Badge
								variant={isSelected ? "default" : "outline"}
								className={cn(
									"cursor-pointer select-none transition-colors",
									isSelected && "bg-primary text-primary-foreground",
								)}
							>
								{isSelected && "✓ "}#{tag.name}
							</Badge>
						</button>
					);
				})}
			</fieldset>
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	);
}
