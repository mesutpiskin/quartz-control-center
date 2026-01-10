/**
 * Job detail information from QRTZ_JOB_DETAILS
 */
export interface JobDetail {
    schedName: string;
    jobName: string;
    jobGroup: string;
    description?: string;
    jobClassName: string;
    isDurable: boolean;
    isNonconcurrent: boolean;
    isUpdateData: boolean;
    requestsRecovery: boolean;
    jobData?: Record<string, any>;
}

/**
 * Trigger information from QRTZ_TRIGGERS and QRTZ_CRON_TRIGGERS
 */
export interface TriggerInfo {
    schedName: string;
    triggerName: string;
    triggerGroup: string;
    jobName: string;
    jobGroup: string;
    description?: string;
    nextFireTime?: number;
    prevFireTime?: number;
    priority: number;
    triggerState: string;
    triggerType: string;
    startTime: number;
    endTime?: number;
    calendarName?: string;
    misfireInstr: number;
    // Cron trigger specific
    cronExpression?: string;
    timeZoneId?: string;
}

/**
 * Currently executing job from QRTZ_FIRED_TRIGGERS
 */
export interface ExecutingJob {
    schedName: string;
    entryId: string;
    triggerName: string;
    triggerGroup: string;
    instanceName: string;
    firedTime: number;
    schedTime: number;
    priority: number;
    state: string;
    jobName: string;
    jobGroup: string;
    isNonconcurrent: boolean;
    requestsRecovery: boolean;
}

/**
 * Scheduler instance information from QRTZ_SCHEDULER_STATE
 */
export interface SchedulerInfo {
    schedName: string;
    instanceName: string;
    lastCheckinTime: number;
    checkinInterval: number;
}

/**
 * Scheduler statistics
 */
export interface SchedulerStatistics {
    totalJobs: number;
    totalTriggers: number;
    executingJobs: number;
    pausedTriggers: number;
    schedulerInstances: number;
}

/**
 * Request to trigger a job manually
 */
export interface TriggerJobRequest {
    jobName: string;
    jobGroup: string;
    jobData?: Record<string, any>;
}

/**
 * Request to pause/resume a job or trigger
 */
export interface JobActionRequest {
    jobName: string;
    jobGroup: string;
}

export interface TriggerActionRequest {
    triggerName: string;
    triggerGroup: string;
}
