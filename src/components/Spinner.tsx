import { clsx } from 'clsx';

type SpinnerProps = {
	size?: 'sm' | 'md' | 'lg';
	label?: string;
	className?: string;
};

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
	sm: 'h-4 w-4 border-2',
	md: 'h-6 w-6 border-[2.5px]',
	lg: 'h-8 w-8 border-[3px]'
};

export default function Spinner({ size = 'md', label, className }: SpinnerProps) {
	return (
		<div className={clsx('flex flex-col items-center justify-center gap-3 py-8', className)}>
			<div
				className={clsx(
					'animate-spin rounded-full border-t-emerald-500 border-emerald-200',
					sizeMap[size]
				)}
			/>
			{label ? <span className="text-sm font-medium text-gray-500">{label}</span> : null}
		</div>
	);
}
