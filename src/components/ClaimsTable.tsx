'use client';

import * as React from 'react';
import type { ColumnDef, FilterFn, Row } from '@tanstack/react-table';
import { ClaimRow, Status } from '@/types';
import { formatD, formatT, formatUSD } from '@/lib/format';
import { CoverageBadge, SyncPill } from './Badge';
import DataTable, { DataTableEmptyProps, DataTableToolbarProps } from './DataTable';

const patientNameFilter: FilterFn<ClaimRow> = (row: Row<ClaimRow>, _columnId: string, filterValue: unknown) => {
  const value = String(filterValue ?? '').toLowerCase();
  const patient = row.original.patientName.toLowerCase();
  return patient.includes(value);
};

const columns: ColumnDef<ClaimRow>[] = [
  {
    accessorKey: 'patientName',
    header: 'Patient',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.patientName}</span>
        <span className="text-[12px] text-gray-500">ID: {row.original.patientId}</span>
      </div>
    )
  },
  {
    accessorKey: 'serviceDate',
    header: 'Service Date',
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
    header: 'Status',
    cell: info => (
      <span className="text-[12px] uppercase tracking-wide text-emerald-900">
        NCOF - {info.getValue<Status>()}
      </span>
    )
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
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
  {
    accessorKey: 'pmsSyncStatus',
    header: 'PMS Sync Status',
    size: 200,
    minSize: 180,
    cell: i => (
      <SyncPill
        state={i.getValue<'Synced' | 'Not synced'>()}
        detail={i.row.original.pmsSyncStatusDetail ?? 'Status modified today'}
      />
    ),
    enableSorting: false
  },
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
];

type ClaimsTableProps = {
  initialPageSize?: number;
};

const ClaimsTable = ({ initialPageSize = 10 }: ClaimsTableProps) => {
  const [data, setData] = React.useState<ClaimRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<Status | ''>('');

  React.useEffect(() => {
    let mounted = true;
    fetch('/claims.json')
      .then(r => r.json())
      .then((rows: ClaimRow[]) => {
        if (mounted) setData(rows);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const toolbar = React.useCallback(({ table, globalFilter, setGlobalFilter }: DataTableToolbarProps<ClaimRow>) => (
    <>
      <input
        value={globalFilter ?? ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search name…"
        className="bg-white h-9 w-64 rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Search name"
      />
      <select
        className="cursor-pointer bg-white h-9 rounded-md border border-gray-300 px-2 text-sm"
        value={statusFilter}
        onChange={(e) => {
          const value = (e.target.value || '') as Status | '';
          setStatusFilter(value);
          table.getColumn('status')?.setFilterValue(value || undefined);
        }}
        aria-label="Status filter"
      >
        <option value="">All Statuses</option>
        <option value="RESUBMITTED">RESUBMITTED</option>
        <option value="PENDING">PENDING</option>
        <option value="REJECTED">REJECTED</option>
        <option value="CALL">CALL</option>
      </select>
    </>
  ), [statusFilter, setStatusFilter]);

  const emptyState = React.useCallback(({ reset }: DataTableEmptyProps<ClaimRow>) => (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm text-gray-600">No results match your filters.</p>
      <button
        onClick={() => {
          reset();
          setStatusFilter('');
        }}
        className="mt-1 rounded-md bg-black px-4 py-2 text-sm text-white"
      >
        Clear filters
      </button>
    </div>
  ), [setStatusFilter]);

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      loading={loading}
      initialPageSize={initialPageSize}
      renderToolbar={toolbar}
      renderEmpty={emptyState}
      onResetFilters={() => setStatusFilter('')}
      globalFilterFn={patientNameFilter}
      cardClassName="rounded-2xl border border-gray-200 bg-white shadow-sm"
      toolbarClassName="flex flex-wrap items-center gap-2"
      tableClassName="min-w-full text-sm"
      theadClassName="bg-white text-left text-xs capitalize text-[#546661]"
      tbodyClassName="divide-y divide-gray-100 text-[#112A24]"
      tbodyStyle={{ fontFamily: 'PolySans, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
      rowClassName="bg-white"
      cellClassName="px-4 py-4 align-top text-left"
      headerCellClassName="px-4 py-3"
      paginationLabel="Rows per page"
      pageSizeIconSrc="/Caret Up Down from DNTEL.png"
      loadingOverlayOffset={52}
      loadingLabel="Loading claims…"
    />
  );
}

export default ClaimsTable;
