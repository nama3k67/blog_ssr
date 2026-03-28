import { highlightCode } from "~/shared/utils/markdown";

type CodeBlockProps = {
	code: string;
	language: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
	const highlighted = highlightCode(code, language);

	return (
		<div className='relative my-4 w-full overflow-hidden rounded-3xl bg-zinc-900'>
			<div
				className='overflow-x-auto p-4 text-sm'
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki-rendered HTML is sanitized syntax-highlighted code, not user input
				dangerouslySetInnerHTML={{ __html: highlighted }}
			/>
		</div>
	);
}
