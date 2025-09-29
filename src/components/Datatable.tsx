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
					<span className="text-[12px] uppercase leading-snug text-gray-900">{info.getValue<string>()}</span>
					<CoverageBadge type={info.row.original.coverageType ?? 'Primary'} />
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
				<span className="text-[12px] font-semibold uppercase tracking-wide text-emerald-900">
					NCOF - {info.getValue<Status>()}
				</span>
			)
		},
		{
			accessorKey: 'lastUpdated',
			header: Sortable('Last Updated'),
			cell: info => {
				const iso = info.getValue<string>();
				return (
					<div className="flex flex-col leading-tight">
						<span className="text-sm font-semibold text-emerald-900">{formatD(iso)}</span>
						<span className="text-[11px] font-medium text-gray-500">{formatT(iso)}</span>
					</div>
				);
			},
			sortingFn: 'datetime'
		},
		{
			accessorKey: 'userInitials',
			header: 'User',
			cell: info => (
				<div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E0FEEF] text-xs font-semibold">
					{info.getValue<string>()}
				</div>
			),
			enableSorting: false
		},
		{ accessorKey: 'dateSent', header: 'Date Sent', cell: i => formatD(i.getValue<string>()), enableSorting: false },
		{ accessorKey: 'dateSentOrig', header: 'Date Sent Orig', cell: i => formatD(i.getValue<string>()), enableSorting: false },
		{ accessorKey: 'pmsSyncStatus', header: 'PMS Sync Status', cell: i => (
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
					<span className="text-sm font-semibold text-emerald-900">{info.getValue<string>()}</span>
					<span className="text-xs font-medium text-gray-400">ID:{info.row.original.providerId}</span>
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

	if (loading) return <Spinner />;

	const empty = table.getRowModel().rows.length === 0;

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

			{/* Table / Empty */}
			{empty ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
					<p className="text-sm text-gray-600">No results match your filters.</p>
					<button
						onClick={() => { setGlobalFilter(''); setStatusFilter(''); }}
						className="mt-3 rounded-md bg-black px-4 py-2 text-sm text-white"
					>
						Clear filters
					</button>
				</div>
			) : (
				<div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-gray-50 text-left text-xs capitalize text-gray-500">
							{table.getHeaderGroups().map(hg => (
								<tr key={hg.id}>
									{hg.headers.map(h => (
										<th key={h.id} className="px-4 py-3">
											{h.isPlaceholder ? null : (
												<div
													className={clsx('flex items-center gap-1 text-xs font-semibold tracking-wide', h.column.getCanSort() && 'cursor-pointer select-none text-gray-600 hover:text-gray-900')}
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
							<tbody>
							{table.getRowModel().rows.map(r => (
								<tr key={r.id} className="odd:bg-white even:bg-gray-50">
									{r.getVisibleCells().map(c => (
										<td key={c.id} className="px-4 py-4 align-top text-gray-900">
											{flexRender(c.column.columnDef.cell, c.getContext())}
										</td>
									))}
								</tr>
							))}
							</tbody>
						</table>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-6 py-5">
						<div className="flex items-center gap-3">
							<div className="relative">
								<select
									className="appearance-none rounded-full border border-gray-200 bg-white px-4 py-2 pr-8 text-sm font-semibold text-emerald-700 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
									value={pagination.pageSize}
									onChange={(e) => setPagination(prev => ({
										...prev,
										pageIndex: 0,
										pageSize: Number(e.target.value)
									}))}
								>
									{[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
								</select>
								<svg
									className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-emerald-600"
									viewBox="0 0 12 8"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<path d="M10.5 2.25 6 6.25 1.5 2.25" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<span className="text-sm font-medium text-gray-600">Rows per page</span>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-600">
								Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
							</span>
							<div className="flex items-center gap-2">
								<PaginationButton
									label="First"
									icon="double-left"
									onClick={() => table.setPageIndex(0)}
									disabled={!table.getCanPreviousPage()}
								/>
								<PaginationButton
									label="Prev"
									icon="left"
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
								/>
								<PaginationButton
									label="Next"
									icon="right"
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}
								/>
								<PaginationButton
									label="Last"
									icon="double-right"
									onClick={() => table.setPageIndex(Math.max(table.getPageCount() - 1, 0))}
									disabled={!table.getCanNextPage()}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
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
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
			aria-label={label}
		>
			<ChevronIcon variant={icon} />
		</button>
	);
}

function ChevronIcon({ variant }: { variant: PaginationIcon }) {
	const props = {
		className: 'h-4 w-4',
		viewBox: '0 0 16 16',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 1.5,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const
	};

	if (variant === 'left') {
		return (
			<svg {...props}>
				<path d="M9.5 4L6 8l3.5 4" />
			</svg>
		);
	}

	if (variant === 'right') {
		return (
			<svg {...props}>
				<path d="M6.5 4l3.5 4-3.5 4" />
			</svg>
		);
	}

	if (variant === 'double-left') {
		return (
			<svg {...props}>
				<path d="M11 4L7.5 8 11 12" />
				<path d="M8.5 4 5 8l3.5 4" />
			</svg>
		);
	}

	return (
		<svg {...props}>
			<path d="M5 4l3.5 4L5 12" />
			<path d="M7.5 4l3.5 4-3.5 4" />
		</svg>
	);
}
