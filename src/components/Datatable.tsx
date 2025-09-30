'use client';

import { CSSProperties, ReactNode, useCallback, useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  SortingState,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import clsx from 'clsx';
import Image from 'next/image';
import Spinner from './Spinner';
import PaginationButton from './PaginationButton';

export type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
};

export type DataTableEmptyProps<TData> = {
  table: Table<TData>;
  reset: () => void;
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  initialPageSize?: number;
  renderToolbar?: (props: DataTableToolbarProps<TData>) => ReactNode;
  renderEmpty?: (props: DataTableEmptyProps<TData>) => ReactNode;
  onResetFilters?: () => void;
  globalFilterFn?: FilterFn<TData>;
  getRowId?: (originalRow: TData, index: number, parent?: unknown) => string;
  cardClassName?: string;
  toolbarClassName?: string;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  tbodyStyle?: CSSProperties;
  rowClassName?: string;
  cellClassName?: string;
  headerCellClassName?: string;
  paginationLabel?: string;
  pageSizeIconSrc?: string;
  pageSizeIconAlt?: string;
  loadingOverlayOffset?: number;
  loadingLabel?: string;
};

const DEFAULT_CARD_CLASS = 'rounded-2xl border border-gray-200 bg-white shadow-sm';
const DEFAULT_TABLE_CLASS = 'min-w-full text-sm';
const DEFAULT_THEAD_CLASS = 'bg-gray-50 text-left text-xs uppercase text-gray-500';
const DEFAULT_TBODY_CLASS = '';
const DEFAULT_ROW_CLASS = '';
const DEFAULT_CELL_CLASS = 'px-4 py-3';
const DEFAULT_HEADER_CELL_CLASS = 'px-4 py-3';

const DataTable = <TData,>({
  columns,
  data,
  loading = false,
  initialPageSize = 10,
  renderToolbar,
  renderEmpty,
  onResetFilters,
  globalFilterFn,
  getRowId,
  cardClassName,
  toolbarClassName,
  tableClassName,
  theadClassName,
  tbodyClassName,
  tbodyStyle,
  rowClassName,
  cellClassName,
  headerCellClassName,
  paginationLabel = 'Rows per page',
  pageSizeIconSrc,
  pageSizeIconAlt = 'Toggle page size',
  loadingOverlayOffset = 0,
  loadingLabel = 'Loading…'
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: initialPageSize });
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize: initialPageSize }));
  }, [initialPageSize]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
    getRowId
  });

  const empty = !loading && table.getRowModel().rows.length === 0;
  const pageCount = table.getPageCount() || 1;
  const currentPage = Math.min(table.getState().pagination.pageIndex + 1, pageCount);

  const handleReset = useCallback(() => {
    setGlobalFilter('');
    table.resetColumnFilters();
    onResetFilters?.();
  }, [table, onResetFilters]);

  return (
    <div className="space-y-3">
      {renderToolbar ? (
        <div className={toolbarClassName ?? 'flex flex-wrap items-center gap-2'}>
          {renderToolbar({ table, globalFilter, setGlobalFilter })}
        </div>
      ) : null}

      <div className={cardClassName ?? DEFAULT_CARD_CLASS}>
        <div className="relative min-h-[360px]">
          {empty ? (
            renderEmpty ? (
              renderEmpty({ table, reset: handleReset })
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-sm text-gray-600">No results match your filters.</p>
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className={tableClassName ?? DEFAULT_TABLE_CLASS}>
                <thead className={theadClassName ?? DEFAULT_THEAD_CLASS}>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className={headerCellClassName ?? DEFAULT_HEADER_CELL_CLASS}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={clsx(
                                'flex items-center gap-1 text-sm font-semibold tracking-wide',
                                header.column.getCanSort() && 'cursor-pointer select-none text-gray-600 hover:text-gray-900'
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && <SortIndicator dir={header.column.getIsSorted()} />}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className={tbodyClassName ?? DEFAULT_TBODY_CLASS} style={tbodyStyle}>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={rowClassName ?? DEFAULT_ROW_CLASS}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className={cellClassName ?? DEFAULT_CELL_CLASS}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loading ? (
            <div
              className="pointer-events-none absolute left-0 right-0 bottom-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm"
              style={{ top: loadingOverlayOffset }}
            >
              <Spinner size="lg" label={loadingLabel} />
            </div>
          ) : null}
        </div>

        {empty ? null : (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className="appearance-none rounded-[12px] border border-gray-200 bg-white px-4 py-2 pr-9 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  disabled={loading}
                >
                  {[10, 25, 50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {pageSizeIconSrc ? (
                  <Image
                    src={pageSizeIconSrc}
                    alt={pageSizeIconAlt}
                    width={16}
                    height={16}
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  />
                ) : null}
              </div>
              <span className="text-sm font-medium text-gray-600">{paginationLabel}</span>
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
                  icon="left"
                  onClick={() => table.previousPage()}
                  disabled={loading || !table.getCanPreviousPage()}
                />
                <PaginationButton
                  label="Next"
                  icon="right"
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

const SortIndicator = ({ dir }: { dir: false | 'asc' | 'desc' }) => {
  if (!dir) return <span aria-hidden>↕︎</span>;
  return <span aria-hidden>{dir === 'asc' ? '↑' : '↓'}</span>;
}

export default DataTable;
