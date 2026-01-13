'use client';

import { useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    PaginationState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    searchPlaceholder?: string;
    defaultPageSize?: number;
}

export function DataTable<TData>({
    columns,
    data,
    searchPlaceholder = 'Search...',
    defaultPageSize = 10,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const getSortIcon = (isSorted: false | 'asc' | 'desc') => {
        if (isSorted === 'asc') return <ArrowUp className="h-3 w-3" />;
        if (isSorted === 'desc') return <ArrowDown className="h-3 w-3" />;
        return <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />;
    };

    return (
        <div className="space-y-4">
            {/* Search and Page Size Controls */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-200 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                        Rows per page:
                    </label>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {[10, 20, 30, 50, 100].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group"
                                            style={{
                                                maxWidth: header.column.columnDef.maxSize,
                                                minWidth: header.column.columnDef.minSize,
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <>
                                                    <div
                                                        className={`flex items-center gap-2 ${
                                                            header.column.getCanSort()
                                                                ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded'
                                                                : ''
                                                        }`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {header.column.getCanSort() && (
                                                            <span>{getSortIcon(header.column.getIsSorted())}</span>
                                                        )}
                                                    </div>
                                                    {header.column.getCanFilter() && (
                                                        <div className="mt-2">
                                                            <input
                                                                type="text"
                                                                value={(header.column.getFilterValue() ?? '') as string}
                                                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                placeholder={`Filter...`}
                                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-sage-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 text-sm text-gray-900 dark:text-white"
                                                style={{
                                                    maxWidth: cell.column.columnDef.maxSize,
                                                    minWidth: cell.column.columnDef.minSize,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                    )}{' '}
                    of {table.getFilteredRowModel().rows.length} results
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300 px-4">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
