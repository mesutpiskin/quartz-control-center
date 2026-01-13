'use client';

import { X, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface JobDetail {
    schedName: string;
    jobName: string;
    jobGroup: string;
    description?: string;
    jobClassName: string;
    isDurable: boolean;
    isNonconcurrent: boolean;
    requestsRecovery: boolean;
    isUpdateData?: boolean;
    jobData?: Record<string, any>;
}

interface JobDetailModalProps {
    job: JobDetail | null;
    isOpen: boolean;
    onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
    const [copied, setCopied] = useState<string | null>(null);

    if (!isOpen || !job) return null;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            
            <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-sage-200 to-sage-300 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Job Details</h2>
                        <p className="text-sage-50 text-sm mt-1">
                            {job.jobGroup}.{job.jobName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-sage-50 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <Section title="Basic Information">
                        <InfoRow label="Job Name" value={job.jobName} />
                        <InfoRow label="Job Group" value={job.jobGroup} />
                        <InfoRow label="Scheduler Name" value={job.schedName} />
                        {job.description && (
                            <InfoRow label="Description" value={job.description} />
                        )}
                    </Section>

                    {/* Class Information */}
                    <Section title="Class Information">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Class Name
                            </label>
                            <div className="flex items-center gap-2">
                                <code className  ="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-mono text-gray-900 dark:text-white overflow-x-auto">
                                    {job.jobClassName}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(job.jobClassName, 'className')}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied === 'className' ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </Section>

                    {/* Properties */}
                    <Section title="Properties">
                        <div className="grid grid-cols-2 gap-4">
                            <PropertyBadge
                                label="Durable"
                                value={job.isDurable}
                                description="Job persists after all triggers are removed"
                            />
                            <PropertyBadge
                                label="Non-Concurrent"
                                value={job.isNonconcurrent}
                                description="Only one instance can execute at a time"
                            />
                            <PropertyBadge
                                label="Requests Recovery"
                                value={job.requestsRecovery}
                                description="Job requests recovery after system failure"
                            />
                            {job.isUpdateData !== undefined && (
                                <PropertyBadge
                                    label="Update Data"
                                    value={job.isUpdateData}
                                    description="Job data is updated after execution"
                                />
                            )}
                        </div>
                    </Section>

                    {/* Job Data */}
                    {job.jobData && Object.keys(job.jobData).length > 0 && (
                        <Section title="Job Data (Parameters)">
                            <div className="space-y-2">
                                {Object.entries(job.jobData).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-2">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]">
                                            {key}:
                                        </span>
                                        <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                        </code>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
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

function PropertyBadge({
    label,
    value,
    description,
}: {
    label: string;
    value: boolean;
    description: string;
}) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <div
                    className={`w-3 h-3 rounded-full ${
                        value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {label}
                </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                {description}
            </p>
        </div>
    );
}
