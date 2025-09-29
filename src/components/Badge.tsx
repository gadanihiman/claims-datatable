import { clsx } from 'clsx';
import type { CoverageType } from '@/types';

export function StatusBadge({ value }: { value: string }) {
	const map: Record<string,string> = {
		RESUBMITTED: 'bg-blue-50 text-blue-700 border border-blue-200',
		PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
		REJECTED: 'bg-rose-50 text-rose-700 border border-rose-200',
		CALL: 'bg-purple-50 text-purple-700 border border-purple-200',
	};
	return (
		<span className={clsx('px-2 py-0.5 text-xs rounded-md', map[value] ?? 'bg-gray-100')}>
      {value}
    </span>
	);
}

const coverageStyles: Record<CoverageType, string> = {
	Primary: 'bg-[#EBF9FE] text-[#23A9EB]',
	Secondary: 'bg-[#FCF8CA] text-[#E98E34]'
};

type CoverageBadgeProps = { type?: CoverageType; fullWidth?: boolean };

export function CoverageBadge({ type = 'Primary', fullWidth = false }: CoverageBadgeProps) {
	return (
		<span className={clsx(
			'inline-flex items-center justify-center rounded-[4px] px-4 py-2 text-[12px] font-semibold',
			fullWidth ? 'w-full' : 'w-fit',
			coverageStyles[type]
		)}>
			{type}
		</span>
	);
}

export function SyncPill({ state, detail }: { state: 'Synced'|'Not synced'; detail?: string }) {
	const synced = state === 'Synced';
	return (
		<div className="flex flex-col items-start gap-1 leading-tight">
			<span
				className={clsx(
					'inline-flex items-center gap-2 rounded-[4px] border px-3 py-1 text-[12px] font-semibold',
					synced
						? 'border-emerald-200 bg-emerald-50 text-emerald-600'
						: 'border-gray-200 bg-gray-100 text-gray-500'
				)}
			>
				{synced ? <CheckIcon /> : <AlertIcon />}
				{state}
			</span>
			{detail ? <span className="text-[10px] font-medium text-gray-500">{detail}</span> : null}
		</div>
	);
}

function CheckIcon() {
	return (
		<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="m4.5 8.5 2.5 2.5 4.5-5" />
		</svg>
	);
}

function AlertIcon() {
	return (
		<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="8" cy="8" r="5.25" />
			<path d="M8 5.5v3" />
			<path d="M8 11h.01" />
		</svg>
	);
}
