'use client';

import { useState, useEffect } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Play, RefreshCw, Activity } from 'lucide-react';

interface ExecutingJob {
    entryId: string;
    triggerName: string;
    triggerGroup: string;
    instanceName: string;
    firedTime: number;
    jobName: string;
    jobGroup: string;
    state: string;
}

export default function ExecutingPage() {
    const { connection, hasConnection } = useConnectionProfiles();
    const [executingJobs, setExecutingJobs] = useState<ExecutingJob[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const loadExecutingJobs = async () => {
        if (!connection) return;

        setIsLoading(true);
        try {
            const response = await apiClient.post(
                '/api/triggers/executing',
                withConnection(connection)
            );
            setExecutingJobs(response.data.executingJobs);
        } catch (error: any) {
            console.error('Failed to load executing jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasConnection) {
            loadExecutingJobs();
        }
    }, [hasConnection]);

    // Auto-refresh every 5 seconds
    useEffect(() => {
        if (!autoRefresh || !hasConnection) return;

        const interval = setInterval(loadExecutingJobs, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, hasConnection]);

    const formatDuration = (timestamp: number) => {
        const duration = Date.now() - timestamp;
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    };

    if (!hasConnection) {
        return (
            <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
                        Executing Jobs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Real-time view of currently running jobs
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto-refresh (5s)</span>
                    </label>
                    <button
                        onClick={loadExecutingJobs}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {executingJobs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Jobs Currently Executing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        All jobs are idle. Running jobs will appear here automatically.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {executingJobs.map((job) => (
                        <div
                            key={job.entryId}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="relative">
                                            <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {job.jobName}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {job.jobGroup}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trigger</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {job.triggerName}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {job.triggerGroup}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Instance</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                                                {job.instanceName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Running Time</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDuration(job.firedTime)}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Started: {new Date(job.firedTime).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-6">
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        {job.state}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Currently Executing:</strong> {executingJobs.length} job(s)
                    {autoRefresh && ' • Auto-refreshing every 5 seconds'}
                </p>
            </div>
        </div>
    );
}
