import { clsx } from 'clsx';
import type { CoverageType } from '@/types';

const coverageStyles: Record<CoverageType, string> = {
	Primary: 'bg-[#EBF9FE] text-[#23A9EB]',
	Secondary: 'bg-[#FCF8CA] text-[#E98E34]'
};

type CoverageBadgeProps = { type?: CoverageType; fullWidth?: boolean };

export const CoverageBadge = ({ type = 'Primary', fullWidth = false }: CoverageBadgeProps) => {
	return (
		<span className={clsx(
			'inline-flex items-center justify-center rounded-[4px] px-4 py-1 text-[12px] font-semibold',
			fullWidth ? 'w-full' : 'w-fit',
			coverageStyles[type]
		)}>
			{type}
		</span>
	);
}

export const SyncPill = ({ state, detail }: { state: 'Synced'|'Not synced'; detail?: string }) => {
	const synced = state === 'Synced';
	return (
		<div className="flex w-full min-w-[120px] flex-col items-center gap-1 leading-tight text-center">
			<span
				className={clsx(
					'inline-flex w-full min-h-[32px] items-center justify-center gap-2 rounded-[4px] border px-3 py-1 text-[12px] font-semibold',
					synced
						? 'border-[#F0F9EB] bg-[#F0F9EB] text-[#01A151]'
						: 'border-[#EAEAEA] bg-[#EAEAEA] text-[#838580]'
				)}
			>
				{synced ? <CheckIcon /> : <AlertIcon />}
				{state}
			</span>
			{detail ? <span className="text-[10px] font-medium text-gray-500">{detail}</span> : null}
		</div>
	);
}

const CheckIcon = () => {
	return (
		<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="m4.5 8.5 2.5 2.5 4.5-5" />
		</svg>
	);
}

const AlertIcon = () => {
	return (
		<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="8" cy="8" r="5.25" />
			<path d="M8 5.5v3" />
			<path d="M8 11h.01" />
		</svg>
	);
}
