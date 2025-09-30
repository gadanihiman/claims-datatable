'use client';

import * as React from 'react';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	useReactTable
} from '@tanstack/react-table';
import Image from 'next/image';
import type { FilterFn, Row } from '@tanstack/react-table';
import { ClaimRow, Status } from '@/types';
import { formatUSD, formatD, formatT } from '@/lib/format';
import Spinner from './Spinner';
import { CoverageBadge, SyncPill } from './Badge';
import { clsx } from 'clsx';

type Props = { initialPageSize?: number };

export default function DataTable({ initialPageSize = 10 }: Props) {
	const [data, setData] = React.useState<ClaimRow[] | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState('');     // name search
	const [statusFilter, setStatusFilter] = React.useState<Status | ''>('');
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: initialPageSize
	});

	React.useEffect(() => {
		setPagination(prev => ({ ...prev, pageSize: initialPageSize }));
	}, [initialPageSize]);

	React.useEffect(() => {
		let mounted = true;
		fetch('/claims.json')
			.then(r => r.json())
			.then((rows: ClaimRow[]) => { if (mounted) setData(rows); })
			.finally(() => setLoading(false));
		return () => { mounted = false; };
	}, []);

	const columns = React.useMemo<ColumnDef<ClaimRow>[]>(() => [
		{
			accessorKey: 'patientName',
			header: Sortable('Patient'),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.patientName}</span>
					<span className="text-[12px] text-gray-500">ID: {row.original.patientId}</span>
				</div>
			)
		},
		{
			accessorKey: 'serviceDate',
			header: Sortable('Service Date'),
			cell: ({ getValue }) => formatD(getValue() as string),
			sortingFn: 'datetime'
		},
		{
			accessorKey: 'insuranceCarrier',
			header: 'Insurance Carrier',
			cell: info => (
				<div className="flex flex-col gap-2">
					<span className="text-[12px] uppercase leading-snug text-[#112A24]">{info.getValue<string>()}</span>
					<CoverageBadge type={info.row.original.coverageType ?? 'Primary'} fullWidth />
				</div>
			),
			enableSorting: false
		},
		{
			accessorKey: 'amountCents',
			header: 'Amount',
			cell: info => formatUSD(info.getValue<number>()),
			enableSorting: false
		},
		{
			accessorKey: 'status',
			header: Sortable('Status'),
			cell: info => (
				<span className="text-[12px] uppercase tracking-wide text-emerald-900">
					NCOF - {info.getValue<Status>()}
				</span>
			)
		},
		{
			accessorKey: 'lastUpdated',
			header: Sortable('Last Updated'),
			size: 160,
			cell: info => {
				const iso = info.getValue<string>();
				return (
					<div className="flex flex-col leading-tight">
						<span className="text-sm">{formatD(iso)}</span>
						<span className="text-[11px] font-semibold text-[#74827F]">{formatT(iso)}</span>
					</div>
				);
			},
			sortingFn: 'datetime'
		},
		{
			accessorKey: 'userInitials',
			header: 'User',
			cell: info => (
				<div className="inline-flex h-[30px] w-[28px] items-center justify-center rounded-full bg-[#E0FEEF] text-sm font-semibold">
					{info.getValue<string>()}
				</div>
			),
			enableSorting: false
		},
		{ accessorKey: 'dateSent', header: 'Date Sent', cell: i => formatD(i.getValue<string>()), enableSorting: false, size: 160 },
		{ accessorKey: 'dateSentOrig', header: 'Date Sent Orig', cell: i => formatD(i.getValue<string>()), enableSorting: false, size: 160 },
		{ accessorKey: 'pmsSyncStatus', header: 'PMS Sync Status', size: 200, minSize: 180, cell: i => (
			<SyncPill
				state={i.getValue<'Synced'|'Not synced'>()}
				detail={i.row.original.pmsSyncStatusDetail ?? 'Status modified today'}
			/>
		), enableSorting: false },
		{
			accessorKey: 'provider',
			header: 'Provider',
			enableSorting: false,
			cell: info => (
				<div className="flex flex-col leading-tight">
					<span className="text-sm text-[#112A24]">{info.getValue<string>()}</span>
					<span className="text-xs font-semibold text-[#B3B3B3]">ID:{info.row.original.providerId}</span>
				</div>
			)
		}
	], []);

	// Global filter = "name contains"
	const globalFilterFn = React.useCallback<FilterFn<ClaimRow>>((row: Row<ClaimRow>, _columnId: string, filterValue: unknown) => {
		const value = String(filterValue ?? '').toLowerCase();
		const patient = row.original.patientName.toLowerCase();
		return patient.includes(value);
	}, []);

	// Single-select status column filter
	const columnFilters = React.useMemo(() => {
		return statusFilter ? [{ id: 'status', value: statusFilter }] : [];
	}, [statusFilter]);

	const table = useReactTable({
		data: data ?? [],
		columns,
		state: { sorting, globalFilter, columnFilters, pagination },
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		globalFilterFn,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: false
	});

	const empty = !loading && table.getRowModel().rows.length === 0;
	const pageCount = table.getPageCount() || 1;
	const currentPage = Math.min(table.getState().pagination.pageIndex + 1, pageCount);

	return (
		<div className="space-y-3">
			{/* Controls */}
			<div className="flex flex-wrap items-center gap-2">
				<input
					value={globalFilter ?? ''}
					onChange={e => setGlobalFilter(e.target.value)}
					placeholder="Search name…"
					className="h-9 w-64 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
					aria-label="Search name"
				/>
				<select
					className="h-9 rounded-md border border-gray-300 px-2 text-sm"
					value={statusFilter}
					onChange={(e) => setStatusFilter((e.target.value || '') as Status | '')}
					aria-label="Status filter"
				>
					<option value="">All Statuses</option>
					<option value="RESUBMITTED">RESUBMITTED</option>
					<option value="PENDING">PENDING</option>
					<option value="REJECTED">REJECTED</option>
					<option value="CALL">CALL</option>
				</select>

			</div>

			{/* Table / Empty / Loading */}
			<div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
				<div className="relative min-h-[360px]">
					{empty ? (
						<div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
							<p className="text-sm text-gray-600">No results match your filters.</p>
							<button
								onClick={() => { setGlobalFilter(''); setStatusFilter(''); }}
								className="mt-1 rounded-md bg-black px-4 py-2 text-sm text-white"
							>
								Clear filters
							</button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead className="bg-white text-left text-xs capitalize text-[#546661]">
								{table.getHeaderGroups().map(hg => (
									<tr key={hg.id}>
										{hg.headers.map(h => (
											<th key={h.id} className="px-4 py-3">
												{h.isPlaceholder ? null : (
													<div
														className={clsx('flex items-center gap-1 text-sm font-[400] tracking-wide', h.column.getCanSort() && 'cursor-pointer select-none text-gray-600 hover:text-gray-900')}
														onClick={h.column.getToggleSortingHandler()}
													>
														{flexRender(h.column.columnDef.header, h.getContext())}
														{h.column.getCanSort() && <SortIndicator dir={h.column.getIsSorted()} />}
													</div>
												)}
											</th>
										))}
									</tr>
								))}
								</thead>
								<tbody
									className="divide-y divide-gray-100 text-[#112A24]"
									style={{ fontFamily: 'PolySans, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
								>
								{table.getRowModel().rows.map(r => (
									<tr key={r.id} className="bg-white">
										{r.getVisibleCells().map(c => (
											<td key={c.id} className="px-4 py-4 align-top text-left">
												{flexRender(c.column.columnDef.cell, c.getContext())}
											</td>
										))}
									</tr>
								))}
								</tbody>
							</table>
						</div>
					)}
					{loading ? (
						<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
							<Spinner size="lg" label="Loading claims…" />
						</div>
					) : null}
				</div>
				{empty ? null : (
					<div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-6 py-5">
						<div className="flex items-center gap-3">
							<div className="relative">
								<select
									className="appearance-none rounded-[12px] border border-gray-200 bg-white px-4 py-2 pr-9 text-sm font-[400] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
									value={pagination.pageSize}
									onChange={(e) => setPagination(prev => ({
										...prev,
										pageIndex: 0,
										pageSize: Number(e.target.value)
									}))}
									disabled={loading}
								>
									{[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
								</select>
								<Image
									src="/Caret Up Down from DNTEL.png"
									alt="Toggle rows per page"
									width={16}
									height={16}
									className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
								/>
							</div>
							<span className="text-sm font-medium text-gray-600">Rows per page</span>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-600">
								{loading ? 'Loading…' : `Page ${currentPage} of ${pageCount}`}
							</span>
							<div className="flex items-center gap-2">
								<PaginationButton
									label="First"
									icon="double-left"
									onClick={() => table.setPageIndex(0)}
									disabled={loading || !table.getCanPreviousPage()}
								/>
								<PaginationButton
									label="Prev"
									icon="right"
									onClick={() => table.previousPage()}
									disabled={loading || !table.getCanPreviousPage()}
								/>
								<PaginationButton
									label="Next"
									icon="left"
									onClick={() => table.nextPage()}
									disabled={loading || !table.getCanNextPage()}
								/>
								<PaginationButton
									label="Last"
									icon="double-right"
									onClick={() => table.setPageIndex(Math.max(table.getPageCount() - 1, 0))}
									disabled={loading || !table.getCanNextPage()}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function Sortable(label: string) {
	return label;
}

function SortIndicator({ dir }: { dir: false | 'asc' | 'desc' }) {
	if (!dir) return <span aria-hidden>↕︎</span>;
	return <span aria-hidden>{dir === 'asc' ? '↑' : '↓'}</span>;
}

type PaginationIcon = 'left' | 'right' | 'double-left' | 'double-right';

type PaginationButtonProps = {
	label: string;
	icon: PaginationIcon;
	onClick: () => void;
	disabled?: boolean;
};

function PaginationButton({ label, icon, onClick, disabled }: PaginationButtonProps) {
	const iconSrc: Record<PaginationIcon, { src: string; rotate?: string }> = {
		left: { src: '/Caret Left from DNTEL.png', rotate: 'rotate-180' },
		right: { src: '/Caret Right from DNTEL.png' },
		'double-left': { src: '/Caret Double Left from DNTEL.png' },
		'double-right': { src: '/Caret Double Right from DNTEL.png' }
	};

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] border border-gray-200 bg-white shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
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
