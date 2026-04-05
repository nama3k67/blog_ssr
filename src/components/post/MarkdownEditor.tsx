import type { ICommand, TextAreaTextApi } from "@uiw/react-md-editor";
import { EyeIcon, ImageIcon, PencilIcon } from "lucide-react";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { toast } from "sonner";

import { ClientOnly } from "~/components/shared/ClientOnly";
import { useI18n } from "~/shared/providers/i18n";
import { useTheme } from "~/shared/providers/theme";
import {
	extractImageFiles,
	insertImageMarkdown,
	uploadImage,
} from "~/shared/utils/upload";

const MDEditor = lazy(() => import("@uiw/react-md-editor"));

const MAX_FILE_SIZE = 500_000; // 500 KB (500,000 bytes)
const MOBILE_BREAKPOINT = "(max-width: 639px)";

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
	// ── Context ────────────────────────────────────────────────────────────────
	const { resolvedTheme } = useTheme();
	const { t } = useI18n();

	// ── State ──────────────────────────────────────────────────────────────────
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	// Lazy-initialize so the first render already knows the correct breakpoint.
	// Falls back to false (desktop mode) in non-browser environments (SSR/tests).
	const [isMobile, setIsMobile] = useState(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia(MOBILE_BREAKPOINT).matches,
	);
	const [showPreview, setShowPreview] = useState(false);

	// ── Refs ───────────────────────────────────────────────────────────────────
	// Stable refs so upload callbacks don't re-create on every keystroke
	const valueRef = useRef(value);
	valueRef.current = value;
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	const fileInputRef = useRef<HTMLInputElement>(null);
	const textApiRef = useRef<TextAreaTextApi | null>(null);
	const failedFilesRef = useRef<File[]>([]);

	// ── Effects ────────────────────────────────────────────────────────────────
	// Track viewport width and reset preview state when leaving mobile
	useEffect(() => {
		const mq = window.matchMedia(MOBILE_BREAKPOINT);
		const handler = (e: MediaQueryListEvent) => {
			setIsMobile(e.matches);
			if (!e.matches) setShowPreview(false);
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// Auto-dismiss upload errors after 5 s
	useEffect(() => {
		if (!uploadError) return;
		const timer = setTimeout(() => setUploadError(null), 5000);
		return () => clearTimeout(timer);
	}, [uploadError]);

	// ── Upload handlers ────────────────────────────────────────────────────────
	const handleUploadFiles = useCallback(
		async (files: File[], api?: TextAreaTextApi | null) => {
			if (files.length === 0) return;

			setUploading(true);
			setUploadError(null);
			const failed: File[] = [];

			try {
				let currentValue = valueRef.current;

				for (const file of files) {
					if (file.size > MAX_FILE_SIZE) {
						toast.error(t.editor.fileTooLarge);
						continue;
					}

					try {
						const url = await uploadImage(file);
						const altText = file.name.replace(/\.[^/.]+$/, "");

						if (api) {
							api.replaceSelection(`![${altText}](${url})`);
						} else {
							currentValue = insertImageMarkdown(currentValue, url, altText);
							onChangeRef.current(currentValue);
						}
					} catch (err) {
						failed.push(file);
						const raw = err instanceof Error ? err.message : "";
						const message = raw.includes("FILE_TOO_LARGE")
							? t.editor.fileTooLarge
							: raw.includes("IMAGE_TOO_WIDE")
								? t.editor.imageTooWide
								: raw.includes("INVALID_FILE_TYPE")
									? t.editor.invalidFileType
									: raw || t.editor.uploadFailed;
						setUploadError(message);
					}
				}
			} finally {
				failedFilesRef.current = failed;
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
			// Reset so the same file can be re-selected
			e.target.value = "";
		},
		[handleUploadFiles],
	);

	// ── Toolbar commands ───────────────────────────────────────────────────────
	const uploadImageCommand: ICommand = useMemo(
		() => ({
			name: "upload-image",
			keyCommand: "upload-image",
			shortcuts: "ctrlcmd+shift+i",
			buttonProps: {
				"aria-label": "Upload image (Ctrl+Shift+I)",
				title: "Upload image",
			},
			icon: <ImageIcon className='size-3.5' />,
			execute: (_state, api) => {
				textApiRef.current = api;
				fileInputRef.current?.click();
			},
		}),
		[],
	);

	// Mobile only: toggles between write-only and preview-only panes
	const togglePreviewCommand: ICommand = useMemo(
		() => ({
			name: "toggle-preview",
			keyCommand: "toggle-preview",
			buttonProps: {
				"aria-label": showPreview ? "Switch to editor" : "Switch to preview",
				title: showPreview ? "Switch to editor" : "Switch to preview",
			},
			icon: showPreview ? (
				<PencilIcon className='size-3.5' />
			) : (
				<EyeIcon className='size-3.5' />
			),
			execute: () => setShowPreview((prev) => !prev),
		}),
		[showPreview],
	);

	const extraCommands = useMemo(
		() =>
			isMobile
				? [uploadImageCommand, togglePreviewCommand]
				: [uploadImageCommand],
		[isMobile, uploadImageCommand, togglePreviewCommand],
	);

	// ── Derived / memos ────────────────────────────────────────────────────────
	const previewMode = isMobile ? (showPreview ? "preview" : "edit") : "live";

	const skeletonFallback = useMemo(
		() => (
			<div
				className='animate-pulse rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
				style={{ height }}
			/>
		),
		[height],
	);

	// ── Render ─────────────────────────────────────────────────────────────────
	return (
		<ClientOnly fallback={skeletonFallback}>
			<div data-color-mode={resolvedTheme} className='relative'>
				{/* Hidden file input for toolbar upload button */}
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					className='hidden'
					onChange={handleFileInputChange}
					multiple
				/>

				{/* Upload in-progress overlay */}
				{uploading && (
					<div className='absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/20 backdrop-blur-[1px]'>
						<div className='rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-lg dark:bg-zinc-800'>
							{t.editor.uploading}
						</div>
					</div>
				)}

				{/* Upload error banner */}
				{uploadError && (
					<div className='mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
						{uploadError}
						<button
							type='button'
							onClick={() => {
								setUploadError(null);
								handleUploadFiles(failedFilesRef.current, textApiRef.current);
							}}
							className='ml-2 font-medium underline'
						>
							{t.editor.retry}
						</button>
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
						preview={previewMode}
						extraCommands={extraCommands}
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
