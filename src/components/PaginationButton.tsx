import Image from "next/image";
import * as React from "react";

type PaginationIcon = 'left' | 'right' | 'double-left' | 'double-right';

type PaginationButtonProps = {
	label: string;
	icon: PaginationIcon;
	onClick: () => void;
	disabled?: boolean;
};

const PaginationButton = ({ label, icon, onClick, disabled }: PaginationButtonProps) => {
	const iconSrc: Record<PaginationIcon, { src: string; rotate?: string }> = {
		left: { src: '/Caret Left from DNTEL.png' },
		right: { src: '/Caret Right from DNTEL.png' },
		'double-left': { src: '/Caret Double Left from DNTEL.png' },
		'double-right': { src: '/Caret Double Right from DNTEL.png' }
	};

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-[14px] border border-gray-200 bg-white shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
			aria-label={label}
		>
			<span className="relative flex h-4 w-4 items-center justify-center">
				<Image
					src={iconSrc[icon].src}
					alt={label}
					width={18}
					height={18}
					className={iconSrc[icon].rotate ? iconSrc[icon].rotate : undefined}
				/>
			</span>
		</button>
	);
}

export default PaginationButton;
