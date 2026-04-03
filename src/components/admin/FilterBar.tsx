import type { EnDict } from "~/locales/en";
import type { LangFilter, StatusFilter } from "./types";

interface FilterBarProps {
	statusFilter: StatusFilter;
	setStatusFilter: (v: StatusFilter) => void;
	langFilter: LangFilter;
	setLangFilter: (v: LangFilter) => void;
	t: EnDict;
}

export function FilterBar({
	statusFilter,
	setStatusFilter,
	langFilter,
	setLangFilter,
	t,
}: FilterBarProps) {
	return (
		<div className='mt-8 flex flex-wrap gap-4'>
			<div className='flex flex-col gap-1'>
				<label
					htmlFor='status-filter'
					className='text-xs font-medium text-zinc-500 dark:text-zinc-400'
				>
					{t.admin.filterByStatus}
				</label>
				<select
					id='status-filter'
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
					className='rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
				>
					<option value='all'>{t.admin.allStatuses}</option>
					<option value='draft'>{t.admin.statusDraft}</option>
					<option value='published'>{t.admin.statusPublished}</option>
				</select>
			</div>
			<div className='flex flex-col gap-1'>
				<label
					htmlFor='lang-filter'
					className='text-xs font-medium text-zinc-500 dark:text-zinc-400'
				>
					{t.admin.filterByLang}
				</label>
				<select
					id='lang-filter'
					value={langFilter}
					onChange={(e) => setLangFilter(e.target.value as LangFilter)}
					className='rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
				>
					<option value='all'>{t.admin.allLanguages}</option>
					<option value='en'>EN</option>
					<option value='vi'>VI</option>
				</select>
			</div>
		</div>
	);
}
