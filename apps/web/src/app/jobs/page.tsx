'use client';

import { useMemo, useState } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Briefcase, Eye, Trash2, RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { JobDetailModal } from '@/components/JobDetailModal';
import { useEffect } from 'react';

interface JobDetail {
    schedName: string;
    jobName: string;
    jobGroup: string;
    description?: string;
    jobClassName: string;
    isDurable: boolean;
    isNonconcurrent: boolean;
    requestsRecovery: boolean;
}

export default function JobsPage() {
    const { connection, hasConnection } = useConnectionProfiles();
    const [jobs, setJobs] = useState<JobDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const loadJobs = async () => {
        if (!connection) return;

        setIsLoading(true);
        try {
            const response = await apiClient.post(
                '/api/jobs/list',
                withConnection(connection)
            );
            setJobs(response.data.jobs);
        } catch (error: any) {
            alert(`Failed to load jobs: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasConnection) {
            loadJobs();
        }
    }, [hasConnection]);

    const deleteJob = async (jobName: string, jobGroup: string) => {
        if (!connection) return;
        if (!confirm(`Are you sure you want to delete job ${jobGroup}.${jobName}?`)) return;

        try {
            await apiClient.post(
                '/api/jobs/delete',
                withConnection(connection, { jobName, jobGroup })
            );
            alert('Job deleted successfully');
            loadJobs();
        } catch (error: any) {
            alert(`Failed to delete job: ${error.response?.data?.message || error.message}`);
        }
    };

    const columns = useMemo<ColumnDef<JobDetail>[]>(
        () => [
            {
                accessorKey: 'jobName',
                header: 'Job Name',
                cell: ({ row }) => (
                    <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-sage-300 mr-3" />
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {row.original.jobName}
                            </div>
                            {row.original.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {row.original.description}
                                </div>
                            )}
                        </div>
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: true,
                maxSize: 250,
                minSize: 200,
            },
            {
                accessorKey: 'jobGroup',
                header: 'Group',
                cell: ({ getValue }) => (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getValue() as string}
                    </span>
                ),
                enableSorting: true,
                enableColumnFilter: true,
                maxSize: 150,
                minSize: 120,
            },
            {
                accessorKey: 'jobClassName',
                header: 'Class',
                cell: ({ getValue }) => {
                    const className = getValue() as string;
                    return (
                        <div className="min-w-0">
                            <div className="text-sm text-gray-900 dark:text-white font-mono truncate">
                                {className.split('.').pop()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate" title={className}>
                                {className}
                            </div>
                        </div>
                    );
                },
                enableSorting: true,
                enableColumnFilter: true,
                maxSize: 300,
                minSize: 250,
            },
            {
                id: 'properties',
                header: 'Properties',
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        {row.original.isDurable && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                Durable
                            </span>
                        )}
                        {row.original.isNonconcurrent && (
                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                                Non-Concurrent
                            </span>
                        )}
                        {row.original.requestsRecovery && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                Recovery
                            </span>
                        )}
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
                maxSize: 250,
                minSize: 200,
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => {
                                setSelectedJob(row.original);
                                setIsDetailModalOpen(true);
                            }}
                            className="text-sage-300 hover:text-sage-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="View Details"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => deleteJob(row.original.jobName, row.original.jobGroup)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Delete Job"
                        >
                            <Trash2 className="h-4 w-4" />
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
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
                        Jobs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your scheduled jobs
                    </p>
                </div>
                <button
                    onClick={loadJobs}
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
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={jobs}
                    searchPlaceholder="Search jobs by name, group, or class..."
                    defaultPageSize={10}
                />
            )}

            <JobDetailModal
                job={selectedJob}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
        </div>
    );
}
