import { highlightCode } from "~/shared/utils/markdown";

type CodeBlockProps = {
	code: string;
	language: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
	const highlighted = highlightCode(code, language);

	return (
		<div className='relative w-full my-4 rounded-lg overflow-hidden bg-slate-950'>
			<div
				className='overflow-x-auto p-4 text-sm bg-slate-950'
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki-rendered HTML is sanitized syntax-highlighted code, not user input
				dangerouslySetInnerHTML={{ __html: highlighted }}
			/>
		</div>
	);
}
