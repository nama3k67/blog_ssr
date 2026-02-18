import { useEffect, useState } from "react";
import { highlightCode } from "~/shared/utils/markdown";

type CodeBlockProps = {
	code: string;
	language: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
	const [highlighted, setHighlighted] = useState<string>("");

	useEffect(() => {
		highlightCode(code, language).then(setHighlighted);
	}, [code, language]);

	return (
		<div className="relative w-full my-4 rounded-lg overflow-hidden bg-slate-950">
			<div
				className="overflow-x-auto p-4 text-sm bg-slate-950"
				dangerouslySetInnerHTML={{ __html: highlighted }}
			/>
		</div>
	);
}
