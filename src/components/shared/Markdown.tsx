import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { lazy, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const CodeBlock = lazy(() =>
	import("~/components/shared/CodeBlock").then((m) => ({
		default: m.CodeBlock,
	})),
);

type MarkdownProps = {
	content: string;
	className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
	return (
		<div className={clsx("prose dark:prose-invert", className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw, rehypeSanitize]}
				components={{
					code({ className: codeClassName, children, ...props }) {
						const isInline = !String(children).includes("\n");
						if (isInline) {
							return <code {...props}>{children}</code>;
						}

						const match = /language-(\w+)/.exec(codeClassName || "");
						const lang = match ? match[1] : "text";
						const code = String(children).replace(/\n$/, "");

						return (
							<Suspense
								fallback={
									<pre className='my-4 overflow-x-auto rounded-3xl bg-zinc-900 p-4 text-sm'>
										<code className={codeClassName}>{children}</code>
									</pre>
								}
							>
								<CodeBlock code={code} language={lang} />
							</Suspense>
						);
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
