'use client';

import { useState, useEffect } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Clock, Pause, Play, RefreshCw } from 'lucide-react';

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
}

export default function TriggersPage() {
    const { connection, hasConnection } = useConnectionProfiles();
    const [triggers, setTriggers] = useState<TriggerInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    const getStateColor = (state: string) => {
        switch (state.toUpperCase()) {
            case 'WAITING':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'PAUSED':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'ACQUIRED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'BLOCKED':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

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
                        View and manage job triggers
                    </p>
                </div>
                <button
                    onClick={loadTriggers}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading triggers...</p>
                </div>
            ) : triggers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Triggers Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        No triggers are configured in this scheduler
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Trigger
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Job
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Schedule
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    State
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fire Times
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {triggers.map((trigger) => (
                                <tr key={`${trigger.triggerGroup}.${trigger.triggerName}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {trigger.triggerName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {trigger.triggerGroup}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {trigger.jobName}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {trigger.jobGroup}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {trigger.cronExpression ? (
                                            <div>
                                                <div className="text-sm font-mono text-gray-900 dark:text-white">
                                                    {trigger.cronExpression}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    CRON
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {trigger.triggerType}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateColor(trigger.triggerState)}`}>
                                            {trigger.triggerState}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            Next: {formatFireTime(trigger.nextFireTime)}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Prev: {formatFireTime(trigger.prevFireTime)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {trigger.triggerState === 'PAUSED' ? (
                                            <button
                                                onClick={() => resumeTrigger(trigger.triggerName, trigger.triggerGroup)}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                title="Resume Trigger"
                                            >
                                                <Play className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => pauseTrigger(trigger.triggerName, trigger.triggerGroup)}
                                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                title="Pause Trigger"
                                            >
                                                <Pause className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
