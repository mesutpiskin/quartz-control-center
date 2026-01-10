'use client';

import { useState, useEffect } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Activity, Server, RefreshCw, BarChart } from 'lucide-react';

interface SchedulerInfo {
    schedName: string;
    instanceName: string;
    lastCheckinTime: number;
    checkinInterval: number;
}

interface SchedulerStatistics {
    totalJobs: number;
    totalTriggers: number;
    executingJobs: number;
    pausedTriggers: number;
    schedulerInstances: number;
}

export default function SchedulerPage() {
    const { connection, hasConnection } = useConnectionProfiles();
    const [schedulerInfo, setSchedulerInfo] = useState<SchedulerInfo[]>([]);
    const [statistics, setStatistics] = useState<SchedulerStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadSchedulerData = async () => {
        if (!connection) return;

        setIsLoading(true);
        try {
            const [infoResponse, statsResponse] = await Promise.all([
                apiClient.post('/api/scheduler/info', withConnection(connection)),
                apiClient.post('/api/scheduler/statistics', withConnection(connection)),
            ]);

            setSchedulerInfo(infoResponse.data.schedulerInfo);
            setStatistics(statsResponse.data.statistics);
        } catch (error: any) {
            alert(`Failed to load scheduler data: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasConnection) {
            loadSchedulerData();
        }
    }, [hasConnection]);

    const formatLastCheckin = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const seconds = Math.floor(diff / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return new Date(timestamp).toLocaleString();
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
                        Scheduler Information
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View scheduler instances and statistics
                    </p>
                </div>
                <button
                    onClick={loadSchedulerData}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        title="Total Jobs"
                        value={statistics.totalJobs}
                        icon={BarChart}
                        color="blue"
                    />
                    <StatCard
                        title="Total Triggers"
                        value={statistics.totalTriggers}
                        icon={Activity}
                        color="purple"
                    />
                    <StatCard
                        title="Executing"
                        value={statistics.executingJobs}
                        icon={Activity}
                        color="green"
                    />
                    <StatCard
                        title="Paused"
                        value={statistics.pausedTriggers}
                        icon={Activity}
                        color="yellow"
                    />
                    <StatCard
                        title="Instances"
                        value={statistics.schedulerInstances}
                        icon={Server}
                        color="orange"
                    />
                </div>
            )}

            {/* Scheduler Instances */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Server className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Scheduler Instances
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                ) : schedulerInfo.length === 0 ? (
                    <div className="p-12 text-center">
                        <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Scheduler Instances
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            No scheduler instances found in the database
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {schedulerInfo.map((instance) => (
                            <div key={instance.instanceName} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                                                <Server className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {instance.instanceName}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Scheduler: {instance.schedName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Check-in</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatLastCheckin(instance.lastCheckinTime)}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {new Date(instance.lastCheckinTime).toLocaleString()}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-in Interval</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {Math.floor(instance.checkinInterval / 1000)}s
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-6">
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: number;
    icon: any;
    color: string;
}) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-yellow-500 to-yellow-600',
        orange: 'from-orange-500 to-orange-600',
    }[color];

    return (
        <div className={`bg-gradient-to-br ${colorClasses} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <p className="text-sm text-white/80">{title}</p>
        </div>
    );
}
