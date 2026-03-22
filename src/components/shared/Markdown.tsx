import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "./CodeBlock";

type MarkdownProps = {
	content: string;
	className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
	return (
		<div className={clsx("prose dark:prose-invert", className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					code({
						className: codeClassName,
						children,
						...props
					}) {
						const isInline = !String(children).includes("\n");
						if (isInline) {
							return (
								<code {...props}>
									{children}
								</code>
							);
						}

						const match = /language-(\w+)/.exec(codeClassName || "");
						const lang = match ? match[1] : "text";
						const code = String(children).replace(/\n$/, "");

						return <CodeBlock code={code} language={lang} />;
					},

					a({ href, children, ...props }) {
						if (href?.startsWith("/")) {
							return (
								<Link to={href} {...props}>
									{children}
								</Link>
							);
						}
						return (
							<a href={href} {...props}>
								{children}
							</a>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
