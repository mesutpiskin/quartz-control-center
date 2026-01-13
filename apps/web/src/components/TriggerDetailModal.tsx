'use client';

import { X, Copy, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useState } from 'react';

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

interface TriggerDetailModalProps {
    trigger: TriggerInfo | null;
    isOpen: boolean;
    onClose: () => void;
}

export function TriggerDetailModal({ trigger, isOpen, onClose }: TriggerDetailModalProps) {
    const [copied, setCopied] = useState<string | null>(null);

    if (!isOpen || !trigger) return null;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return 'Not set';
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
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

    const formatCronExpression = (cron?: string) => {
        if (!cron) return null;
        
        try {
            // Use cronstrue if available, otherwise just show the expression
            if (typeof window !== 'undefined' && (window as any).cronstrue) {
                return (window as any).cronstrue.toString(cron);
            }
        } catch (e) {
            // Fallback to raw expression
        }
        return cron;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            
            <div className="absolute inset-y-0 right-0 max-w-3xl w-full bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Trigger Details</h2>
                        <p className="text-purple-100 text-sm mt-1">
                            {trigger.triggerGroup}.{trigger.triggerName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-purple-100 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <Section title="Basic Information">
                        <InfoRow label="Trigger Name" value={trigger.triggerName} />
                        <InfoRow label="Trigger Group" value={trigger.triggerGroup} />
                        <InfoRow label="Trigger Type" value={trigger.triggerType} />
                        {trigger.description && (
                            <InfoRow label="Description" value={trigger.description} />
                        )}
                        <div className="flex items-center py-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-1/3">
                                State
                            </span>
                            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getStateColor(trigger.triggerState)}`}>
                                {trigger.triggerState}
                            </span>
                        </div>
                        <InfoRow label="Priority" value={String(trigger.priority)} />
                    </Section>

                    {/* Linked Job */}
                    <Section title="Linked Job">
                        <InfoRow label="Job Name" value={trigger.jobName} />
                        <InfoRow label="Job Group" value={trigger.jobGroup} />
                        <div className="mt-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                                {trigger.jobGroup}.{trigger.jobName}
                            </code>
                        </div>
                    </Section>

                    {/* Schedule Information */}
                    {trigger.cronExpression && (
                        <Section title="Cron Schedule">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Expression
                                    </label>
                                    <div className="flex-1 flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-mono text-gray-900 dark:text-white">
                                            {trigger.cronExpression}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(trigger.cronExpression!, 'cron')}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            {copied === 'cron' ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Meaning:</strong> {formatCronExpression(trigger.cronExpression) || trigger.cronExpression}
                                    </p>
                                </div>
                                {trigger.timeZoneId && (
                                    <InfoRow label="Timezone" value={trigger.timeZoneId} />
                                )}
                            </div>
                        </Section>
                    )}

                    {/* Execution Times */}
                    <Section title="Execution Times">
                        <div className="space-y-4">
                            <TimeRow
                                icon={<Clock className="h-5 w-5 text-green-600" />}
                                label="Next Fire Time"
                                time={trigger.nextFireTime}
                            />
                            <TimeRow
                                icon={<Clock className="h-5 w-5 text-blue-600" />}
                                label="Previous Fire Time"
                                time={trigger.prevFireTime}
                            />
                            <TimeRow
                                icon={<Calendar className="h-5 w-5 text-purple-600" />}
                                label="Start Time"
                                time={trigger.startTime}
                            />
                            <TimeRow
                                icon={<Calendar className="h-5 w-5 text-orange-600" />}
                                label="End Time"
                                time={trigger.endTime}
                            />
                        </div>
                    </Section>

                    {/* Advanced Configuration */}
                    <Section title="Advanced Configuration">
                        {trigger.calendarName && (
                            <InfoRow label="Calendar Name" value={trigger.calendarName} />
                        )}
                        {trigger.misfireInstr !== undefined && (
                            <InfoRow label="Misfire Instruction" value={String(trigger.misfireInstr)} />
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {title}
            </h3>
            {children}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-1/3">
                {label}
            </span>
            <span className="text-sm text-gray-900 dark:text-white w-2/3">
                {value}
            </span>
        </div>
    );
}

function TimeRow({ icon, label, time }: { icon: React.ReactNode; label: string; time?: number }) {
    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return 'Not set';
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getRelativeTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const diff = timestamp - Date.now();
        const absDiff = Math.abs(diff);
        
        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${diff > 0 ? 'in' : ''} ${days}d ${diff < 0 ? 'ago' : ''}`;
        if (hours > 0) return `${diff > 0 ? 'in' : ''} ${hours}h ${diff < 0 ? 'ago' : ''}`;
        if (minutes > 0) return `${diff > 0 ? 'in' : ''} ${minutes}m ${diff < 0 ? 'ago' : ''}`;
        return `${diff > 0 ? 'in' : ''} ${seconds}s ${diff < 0 ? 'ago' : ''}`;
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {icon}
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatTimestamp(time)}
                </p>
                {time && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        {getRelativeTime(time)}
                    </p>
                )}
            </div>
        </div>
    );
}
