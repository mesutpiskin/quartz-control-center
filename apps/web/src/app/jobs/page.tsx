'use client';

import { useState, useEffect } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Briefcase, Play, Pause, Trash2, RefreshCw, Search } from 'lucide-react';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('');

    const loadJobs = async () => {
        if (!connection) return;

        setIsLoading(true);
        try {
            const response = await apiClient.post(
                '/api/jobs/list',
                withConnection(connection, { filterGroup: selectedGroup || undefined })
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
    }, [hasConnection, selectedGroup]);

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

    const filteredJobs = jobs.filter(job =>
        job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobClassName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const jobGroups = Array.from(new Set(jobs.map(j => j.jobGroup)));

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
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Groups</option>
                        {jobGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Jobs Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'No jobs match your search criteria' : 'No jobs are configured in this scheduler'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Job Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Group
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Class
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Properties
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredJobs.map((job) => (
                                <tr key={`${job.jobGroup}.${job.jobName}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {job.jobName}
                                                </div>
                                                {job.description && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {job.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {job.jobGroup}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                            {job.jobClassName.split('.').pop()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                            {job.jobClassName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {job.isDurable && (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                                    Durable
                                                </span>
                                            )}
                                            {job.isNonconcurrent && (
                                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                                                    Non-Concurrent
                                                </span>
                                            )}
                                            {job.requestsRecovery && (
                                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                                    Recovery
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteJob(job.jobName, job.jobGroup)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-4"
                                            title="Delete Job"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Total Jobs:</strong> {filteredJobs.length} {searchTerm && `(filtered from ${jobs.length})`}
                </p>
            </div>
        </div>
    );
}
