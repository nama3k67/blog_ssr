import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "./CodeBlock";

type MarkdownProps = {
	content: string;
	className?: string;
};

export function Markdown({ content, className = "" }: MarkdownProps) {
	return (
		<div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					// Code blocks and inline code
					code({
						node,
						inline,
						className: codeClassName,
						children,
						...props
					}: any) {
						if (inline) {
							return (
								<code
									className="bg-gray-100 dark:bg-gray-900 rounded px-1.5 py-0.5 text-sm font-mono"
									{...props}
								>
									{children}
								</code>
							);
						}

						const match = /language-(\w+)/.exec(codeClassName || "");
						const lang = match ? match[1] : "text";
						const code = String(children).replace(/\n$/, "");

						return <CodeBlock code={code} language={lang} />;
					},

					// Links
					a({ node, href, children, ...props }: any) {
						if (href?.startsWith("/")) {
							return (
								<Link to={href} {...props}>
									{children}
								</Link>
							);
						}
						return (
							<a
								href={href}
								className="text-blue-600 hover:underline"
								{...props}
							>
								{children}
							</a>
						);
					},

					// Images
					img({ node, src, alt, ...props }: any) {
						return (
							<img
								src={src}
								alt={alt}
								loading="lazy"
								className="rounded-lg shadow-md"
								{...props}
							/>
						);
					},

					// Headings
					h1({ node, children, ...props }: any) {
						return (
							<h1 className="text-4xl font-bold mt-8 mb-4" {...props}>
								{children}
							</h1>
						);
					},
					h2({ node, children, ...props }: any) {
						return (
							<h2 className="text-3xl font-bold mt-8 mb-4" {...props}>
								{children}
							</h2>
						);
					},
					h3({ node, children, ...props }: any) {
						return (
							<h3 className="text-2xl font-bold mt-6 mb-3" {...props}>
								{children}
							</h3>
						);
					},

					// Lists
					ul({ node, children, ...props }: any) {
						return (
							<ul
								className="list-disc list-outside space-y-3 my-4 ml-6"
								{...props}
							>
								{children}
							</ul>
						);
					},
					ol({ node, children, ...props }: any) {
						return (
							<ol
								className="list-decimal list-outside space-y-3 my-4 ml-6"
								{...props}
							>
								{children}
							</ol>
						);
					},
					li({ node, children, ...props }: any) {
						return <li {...props}>{children}</li>;
					},

					// Blockquotes
					blockquote({ node, children, ...props }: any) {
						return (
							<blockquote
								className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
								{...props}
							>
								{children}
							</blockquote>
						);
					},

					// Tables
					table({ node, children, ...props }: any) {
						return (
							<table
								className="border-collapse border border-gray-300 dark:border-gray-600 w-full my-4"
								{...props}
							>
								{children}
							</table>
						);
					},
					thead({ node, children, ...props }: any) {
						return (
							<thead className="bg-gray-100 dark:bg-gray-800" {...props}>
								{children}
							</thead>
						);
					},
					th({ node, children, ...props }: any) {
						return (
							<th
								className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold"
								{...props}
							>
								{children}
							</th>
						);
					},
					td({ node, children, ...props }: any) {
						return (
							<td
								className="border border-gray-300 dark:border-gray-600 px-4 py-2"
								{...props}
							>
								{children}
							</td>
						);
					},

					// Paragraph
					p({ node, children, ...props }: any) {
						return (
							<p className="my-4 leading-7" {...props}>
								{children}
							</p>
						);
					},

					// Horizontal rule
					hr({ node, ...props }: any) {
						return (
							<hr
								className="my-8 border-gray-300 dark:border-gray-600"
								{...props}
							/>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
