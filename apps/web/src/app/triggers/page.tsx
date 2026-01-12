'use client';

import { useState, useEffect } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, withConnection } from '@/lib/api/client';
import { Clock, Pause, Play, RefreshCw, ChevronRight, ChevronDown, Edit, FileText } from 'lucide-react';

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
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

    const toggleRow = (triggerId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(triggerId)) {
            newExpanded.delete(triggerId);
        } else {
            newExpanded.add(triggerId);
        }
        setExpandedRows(newExpanded);
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-10">
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Trigger
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Job
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Schedule
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    State
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Fire Times
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {triggers.map((trigger) => {
                                const triggerId = `${trigger.triggerGroup}.${trigger.triggerName}`;
                                const isExpanded = expandedRows.has(triggerId);

                                return (
                                    <>
                                        <tr key={triggerId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-3 py-3">
                                                <button
                                                    onClick={() => toggleRow(triggerId)}
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform"
                                                    title={isExpanded ? "Collapse" : "Expand"}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {trigger.triggerName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {trigger.triggerGroup}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900 dark:text-white truncate">
                                                    {trigger.jobName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {trigger.jobGroup}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {trigger.cronExpression ? (
                                                    <div>
                                                        <div className="text-xs font-mono text-gray-900 dark:text-white">
                                                            {trigger.cronExpression}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            CRON
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {trigger.triggerType}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStateColor(trigger.triggerState)}`}>
                                                    {trigger.triggerState}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-gray-900 dark:text-white">
                                                    <span className="text-gray-500">Next:</span> {formatFireTime(trigger.nextFireTime)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span>Prev:</span> {formatFireTime(trigger.prevFireTime)}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Detail Row */}
                                        {isExpanded && (
                                            <tr key={`${triggerId}-detail`} className="bg-gray-50 dark:bg-gray-900">
                                                <td colSpan={6} className="px-4 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Left Column - Information */}
                                                        <div className="space-y-3">
                                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Trigger Details</h4>

                                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">{trigger.triggerType}</span>
                                                                </div>
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">{trigger.priority}</span>
                                                                </div>
                                                                {trigger.cronExpression && (
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-gray-500 dark:text-gray-400">Cron:</span>
                                                                        <span className="font-mono font-medium text-gray-900 dark:text-white">{trigger.cronExpression}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right Column - Actions */}
                                                        <div className="space-y-3">
                                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Actions</h4>

                                                            <div className="space-y-2">
                                                                {/* Pause/Resume Button */}
                                                                {trigger.triggerState === 'PAUSED' ? (
                                                                    <button
                                                                        onClick={() => resumeTrigger(trigger.triggerName, trigger.triggerGroup)}
                                                                        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                                                    >
                                                                        <Play className="h-4 w-4" />
                                                                        <span>Resume</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => pauseTrigger(trigger.triggerName, trigger.triggerGroup)}
                                                                        className="w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                                                    >
                                                                        <Pause className="h-4 w-4" />
                                                                        <span>Pause</span>
                                                                    </button>
                                                                )}

                                                                {/* Edit Cron Button */}
                                                                {trigger.cronExpression && (
                                                                    <button
                                                                        onClick={() => alert('Cron düzenleme özelliği yakında eklenecek!')}
                                                                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        <span>Edit Cron</span>
                                                                    </button>
                                                                )}

                                                                {/* View Logs Button */}
                                                                <button
                                                                    onClick={() => alert('Log görüntüleme özelliği yakında eklenecek!')}
                                                                    className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                    <span>Logs</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
