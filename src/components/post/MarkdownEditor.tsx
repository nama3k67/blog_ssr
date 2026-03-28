import type { ICommand, TextAreaTextApi } from "@uiw/react-md-editor";
import { ImageIcon } from "lucide-react";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { ClientOnly } from "~/components/shared/ClientOnly";
import { useI18n } from "~/shared/providers/i18n";
import { useTheme } from "~/shared/providers/theme";
import {
	extractImageFiles,
	insertImageMarkdown,
	uploadImage,
} from "~/shared/utils/upload";

const MDEditor = lazy(() => import("@uiw/react-md-editor"));

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type MarkdownEditorProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	height?: number;
};

export function MarkdownEditor({
	value,
	onChange,
	placeholder,
	height = 500,
}: MarkdownEditorProps) {
	const { resolvedTheme } = useTheme();
	const { t } = useI18n();
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textApiRef = useRef<TextAreaTextApi | null>(null);

	// Refs to avoid recreating callbacks on every keystroke
	const valueRef = useRef(value);
	valueRef.current = value;
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	// Auto-dismiss upload error after 5s
	useEffect(() => {
		if (!uploadError) return;
		const timer = setTimeout(() => setUploadError(null), 5000);
		return () => clearTimeout(timer);
	}, [uploadError]);

	const handleUploadFiles = useCallback(
		async (files: File[], api?: TextAreaTextApi | null) => {
			if (files.length === 0) return;

			setUploading(true);
			setUploadError(null);

			try {
				let currentValue = valueRef.current;

				for (const file of files) {
					if (file.size > MAX_FILE_SIZE) {
						setUploadError(t.editor.fileTooLarge);
						continue;
					}

					try {
						const url = await uploadImage(file);
						const altText = file.name.replace(/\.[^/.]+$/, "");

						if (api) {
							// Insert at cursor position via the editor API
							api.replaceSelection(`![${altText}](${url})`);
						} else {
							// Fallback: append to content using accumulator
							currentValue = insertImageMarkdown(currentValue, url, altText);
							onChangeRef.current(currentValue);
						}
					} catch (err) {
						const message =
							err instanceof Error ? err.message : t.editor.uploadFailed;
						setUploadError(message);
					}
				}
			} finally {
				setUploading(false);
			}
		},
		[t],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			const files = extractImageFiles(e.dataTransfer);
			if (files.length > 0) {
				e.preventDefault();
				handleUploadFiles(files, textApiRef.current);
			}
		},
		[handleUploadFiles],
	);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent) => {
			const files = extractImageFiles(e.clipboardData);
			if (files.length > 0) {
				e.preventDefault();
				handleUploadFiles(files, textApiRef.current);
			}
		},
		[handleUploadFiles],
	);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || []);
			if (files.length > 0) {
				handleUploadFiles(files, textApiRef.current);
			}
			// Reset input so the same file can be selected again
			e.target.value = "";
		},
		[handleUploadFiles],
	);

	const uploadImageCommand: ICommand = useMemo(
		() => ({
			name: "upload-image",
			keyCommand: "upload-image",
			shortcuts: "ctrlcmd+shift+i",
			icon: <ImageIcon className='size-3.5' />,
			execute: (_state, api) => {
				// Store the api ref for later use by file input handler
				textApiRef.current = api;
				fileInputRef.current?.click();
			},
		}),
		[],
	);

	const skeletonFallback = useMemo(
		() => (
			<div
				className='animate-pulse rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
				style={{ height }}
			/>
		),
		[height],
	);

	return (
		<ClientOnly fallback={skeletonFallback}>
			<div data-color-mode={resolvedTheme} className='relative'>
				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					className='hidden'
					onChange={handleFileInputChange}
					multiple
				/>

				{/* Upload status overlay */}
				{uploading && (
					<div className='absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/20 backdrop-blur-[1px]'>
						<div className='rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-lg dark:bg-zinc-800'>
							{t.editor.uploading}
						</div>
					</div>
				)}

				{/* Upload error */}
				{uploadError && (
					<div className='mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
						{uploadError}
						<button
							type='button'
							onClick={() => setUploadError(null)}
							className='ml-2 font-medium underline'
						>
							✕
						</button>
					</div>
				)}

				<Suspense fallback={skeletonFallback}>
					<MDEditor
						value={value}
						onChange={(val) => onChange(val || "")}
						height={height}
						preview='live'
						extraCommands={[uploadImageCommand]}
						textareaProps={{
							placeholder,
							onDrop: handleDrop,
							onPaste: handlePaste,
						}}
					/>
				</Suspense>
			</div>
		</ClientOnly>
	);
}
