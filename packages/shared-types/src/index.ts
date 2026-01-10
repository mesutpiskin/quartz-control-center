export interface DatabaseConnection {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    schema: string;
    databaseType: 'postgresql' | 'mysql' | 'mssql';
}

export interface ConnectionProfile {
    id: string;
    name: string;
    connection: DatabaseConnection;
    createdAt: string;
    lastUsed?: string;
}

export interface ProfilesData {
    profiles: ConnectionProfile[];
    activeProfileId: string | null;
}

export interface JobDetail {
    schedName: string;
    jobName: string;
    jobGroup: string;
    description?: string;
    jobClassName: string;
    isDurable: boolean;
    isNonconcurrent: boolean;
    requestsRecovery: boolean;
    jobData?: Record<string, any>;
}

export interface TriggerInfo {
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

export interface ExecutingJob {
    entryId: string;
    triggerName: string;
    triggerGroup: string;
    instanceName: string;
    firedTime: number;
    jobName: string;
    jobGroup: string;
    state: string;
}

export interface SchedulerInfo {
    schedName: string;
    instanceName: string;
    lastCheckinTime: number;
    checkinInterval: number;
}

export interface SchedulerStatistics {
    totalJobs: number;
    totalTriggers: number;
    executingJobs: number;
    pausedTriggers: number;
    schedulerInstances: number;
}
