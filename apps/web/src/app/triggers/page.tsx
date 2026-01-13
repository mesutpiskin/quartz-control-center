'use client';

import { useMemo, useState, useEffect } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Clock, Pause, Play, RefreshCw, Eye } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { TriggerDetailModal } from '@/components/TriggerDetailModal';

interface TriggerInfo {
    triggerName: string;
    triggerGroup: string;
    jobName: string;
    jobGroup: string;
    nextFireTime?: number;
    prevFireTime?: number;
    triggerState: string;
    triggerType: string;
    cronExpression?: string;
    priority: number;
    startTime?: number;
    endTime?: number;
    calendarName?: string;
    timeZoneId?: string;
    misfireInstr?: number;
    description?: string;
}

export default function TriggersPage() {
    const { connection, hasConnection } = useConnectionProfiles();
    const [triggers, setTriggers] = useState<TriggerInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTrigger, setSelectedTrigger] = useState<TriggerInfo | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const loadTriggers = async () => {
        if (!connection) return;

        setIsLoading(true);
        try {
            const response = await apiClient.post(
                '/api/triggers/list',
                withConnection(connection)
            );
            setTriggers(response.data.triggers);
        } catch (error: any) {
            alert(`Failed to load triggers: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasConnection) {
            loadTriggers();
        }
    }, [hasConnection]);

    const pauseTrigger = async (triggerName: string, triggerGroup: string) => {
        if (!connection) return;

        try {
            await apiClient.post(
                '/api/triggers/pause',
                withConnection(connection, { triggerName, triggerGroup })
            );
            alert('Trigger paused successfully');
            loadTriggers();
        } catch (error: any) {
            alert(`Failed to pause trigger: ${error.response?.data?.message || error.message}`);
        }
    };

    const resumeTrigger = async (triggerName: string, triggerGroup: string) => {
        if (!connection) return;

        try {
            await apiClient.post(
                '/api/triggers/resume',
                withConnection(connection, { triggerName, triggerGroup })
            );
            alert('Trigger resumed successfully');
            loadTriggers();
        } catch (error: any) {
            alert(`Failed to resume trigger: ${error.response?.data?.message || error.message}`);
        }
    };

    const formatFireTime = (timestamp?: number) => {
        if (!timestamp) return 'Not set';
        const date = new Date(timestamp);
        const now = Date.now();
        const diff = timestamp - now;

        if (Math.abs(diff) < 60000) return 'Less than a minute';
        if (Math.abs(diff) < 3600000) return `${Math.floor(Math.abs(diff) / 60000)}m ${diff > 0 ? 'from now' : 'ago'}`;
        if (Math.abs(diff) < 86400000) return `${Math.floor(Math.abs(diff) / 3600000)}h ${diff > 0 ? 'from now' : 'ago'}`;

        return date.toLocaleString();
    };

    const getStateColor = (state: string) => {
        const colors: Record<string, string> = {
            NORMAL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            ERROR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            COMPLETE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        };
        return colors[state] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const columns = useMemo<ColumnDef<TriggerInfo>[]>(
        () => [
            {
                accessorKey: 'triggerName',
                header: 'Trigger Name',
                cell: ({ row }) => (
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {row.original.triggerName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {row.original.triggerGroup}
                            </div>
                        </div>
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: true,
                maxSize: 220,
                minSize: 180,
            },
            {
                accessorKey: 'jobName',
                header: 'Job',
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                            {row.original.jobName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {row.original.jobGroup}
                        </div>
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: true,
                maxSize: 200,
                minSize: 150,
            },
            {
                accessorKey: 'nextFireTime',
                header: 'Next Fire',
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                            {formatFireTime(row.original.nextFireTime)}
                        </div>
                        {row.original.prevFireTime && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                Prev: {formatFireTime(row.original.prevFireTime)}
                            </div>
                        )}
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: false,
                sortingFn: 'basic',
                maxSize: 200,
                minSize: 150,
            },
            {
                accessorKey: 'triggerState',
                header: 'State',
                cell: ({ getValue }) => (
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStateColor(getValue() as string)}`}>
                        {getValue() as string}
                    </span>
                ),
                enableSorting: true,
                enableColumnFilter: true,
                maxSize: 120,
                minSize: 100,
            },
            {
                accessorKey: 'triggerType',
                header: 'Type',
                cell: ({ getValue }) => (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {getValue() as string}
                    </span>
                ),
                enableSorting: true,
                enableColumnFilter: true,
                maxSize: 120,
                minSize: 100,
            },
            {
                accessorKey: 'cronExpression',
                header: 'Cron Expression',
                cell: ({ row }) => {
                    if (row.original.cronExpression) {
                        return (
                            <div className="text-xs font-mono text-gray-900 dark:text-white truncate" title={row.original.cronExpression}>
                                {row.original.cronExpression}
                            </div>
                        );
                    }
                    return <span className="text-xs text-gray-400">-</span>;
                },
                enableSorting: false,
                enableColumnFilter: true,
                maxSize: 200,
                minSize: 150,
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-1">
                        {row.original.triggerState === 'PAUSED' ? (
                            <button
                                onClick={() => resumeTrigger(row.original.triggerName, row.original.triggerGroup)}
                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Resume"
                            >
                                <Play className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => pauseTrigger(row.original.triggerName, row.original.triggerGroup)}
                                className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Pause"
                            >
                                <Pause className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setSelectedTrigger(row.original);
                                setIsDetailModalOpen(true);
                            }}
                            className="p-1 text-sage-300 hover:text-sage-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="View Details"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
                maxSize: 120,
                minSize: 100,
            },
        ],
        []
    );

    if (!hasConnection) {
        return (
            <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Triggers
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage job triggers and schedules
                    </p>
                </div>
                <button
                    onClick={loadTriggers}
                    disabled={isLoading}
                    className="bg-sage-200 hover:bg-sage-300 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-200 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading triggers...</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={triggers}
                    searchPlaceholder="Search triggers by name, job, or schedule..."
                    defaultPageSize={10}
                />
            )}

            <TriggerDetailModal
                trigger={selectedTrigger}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
        </div>
    );
}
