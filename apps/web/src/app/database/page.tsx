'use client';

import { useState, useEffect } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Database, Table, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface QuartzTable {
    name: string;
    rowCount: number;
    description: string;
}

interface TableColumn {
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
}

interface TableDataResponse {
    data: any[];
    total: number;
    page: number;
    pageSize: number;
}

export default function DatabaseViewPage() {
    const { connection, hasConnection } = useConnectionProfiles();
    const [tables, setTables] = useState<QuartzTable[]>([]);
    const [filteredTables, setFilteredTables] = useState<QuartzTable[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<TableDataResponse | null>(null);
    const [tableSchema, setTableSchema] = useState<TableColumn[]>([]);
    const [isLoadingTables, setIsLoadingTables] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    const loadTables = async () => {
        if (!connection) return;

        setIsLoadingTables(true);
        try {
            const response = await apiClient.post(
                '/api/database-view/tables',
                withConnection(connection)
            );
            setTables(response.data.tables);
            setFilteredTables(response.data.tables);
        } catch (error: any) {
            alert(`Failed to load tables: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoadingTables(false);
        }
    };

    const loadTableData = async (tableName: string, page: number = 1) => {
        if (!connection) return;

        setIsLoadingData(true);
        try {
            const [dataResponse, schemaResponse] = await Promise.all([
                apiClient.post(
                    '/api/database-view/table-data',
                    withConnection(connection, { tableName, page, pageSize })
                ),
                apiClient.post(
                    '/api/database-view/table-schema',
                    withConnection(connection, { tableName })
                )
            ]);

            setTableData(dataResponse.data);
            setTableSchema(schemaResponse.data.columns);
            setCurrentPage(page);
        } catch (error: any) {
            alert(`Failed to load table data: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (hasConnection) {
            loadTables();
        }
    }, [hasConnection]);

    useEffect(() => {
        const filtered = tables.filter(table =>
            table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            table.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTables(filtered);
    }, [searchQuery, tables]);

    const handleTableSelect = (tableName: string) => {
        setSelectedTable(tableName);
        setCurrentPage(1);
        loadTableData(tableName, 1);
    };

    const handlePageChange = (newPage: number) => {
        if (selectedTable) {
            loadTableData(selectedTable, newPage);
        }
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const totalPages = tableData ? Math.ceil(tableData.total / pageSize) : 0;

    if (!hasConnection) {
        return (
            <div className="text-center py-12">
                <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No Database Connection
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Please configure your database connection in Settings
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Data View
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Browse Quartz database tables and their contents
                    </p>
                </div>
                <button
                    onClick={loadTables}
                    disabled={isLoadingTables}
                    className="bg-sage-200 hover:bg-sage-300 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                    <RefreshCw className={`h-5 w-5 ${isLoadingTables ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Panel - Table List */}
                <div className="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tables..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {isLoadingTables ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading tables...</p>
                            </div>
                        ) : filteredTables.length === 0 ? (
                            <div className="text-center py-8">
                                <Table className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">No tables found</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredTables.map((table) => (
                                    <button
                                        key={table.name}
                                        onClick={() => handleTableSelect(table.name)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                            selectedTable === table.name
                                                ? 'bg-sage-100 dark:bg-sage-300 text-sage-300 dark:text-sage-50'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <Table className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">{table.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {table.description}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {table.rowCount.toLocaleString()} rows
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Table Data */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col min-w-0">
                    {!selectedTable ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Select a Table
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose a table from the list to view its contents
                                </p>
                            </div>
                        </div>
                    ) : isLoadingData ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading table data...</p>
                            </div>
                        </div>
                    ) : tableData && tableData.data.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Table className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Empty Table
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    This table contains no data
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedTable}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {tableData?.total.toLocaleString()} total rows
                                </p>
                            </div>

                            {/* Data Grid */}
                            <div className="flex-1 overflow-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                        <tr>
                                            {tableSchema.map((column) => (
                                                <th
                                                    key={column.name}
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                                                >
                                                    <div>
                                                        <div>{column.name}</div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-500 normal-case font-normal">
                                                            {column.type}
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {tableData?.data.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                {tableSchema.map((column) => (
                                                    <td
                                                        key={column.name}
                                                        className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                                                    >
                                                        <span className={row[column.name] === null ? 'text-gray-400 italic' : ''}>
                                                            {formatValue(row[column.name])}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
