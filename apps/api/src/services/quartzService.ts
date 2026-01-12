import { connectionManager } from '../db/connectionManager';
import { DatabaseConnection } from '../db/databaseTypes';
import {
    JobDetail,
    TriggerInfo,
    ExecutingJob,
    SchedulerInfo,
    SchedulerStatistics
} from '../models/job.model';
import cronstrue from 'cronstrue';

/**
 * Service for Quartz job operations using direct SQL queries
 */
export class QuartzService {
    private getSchemaPrefix(schema?: string): string {
        return schema ? `${schema}.` : '';
    }

    /**
     * Get all jobs from QRTZ_JOB_DETAILS
     */
    async getAllJobs(config: DatabaseConnection, filterGroup?: string): Promise<JobDetail[]> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        let query = `
      SELECT 
        sched_name,
        job_name,
        job_group,
        description,
        job_class_name,
        is_durable,
        is_nonconcurrent,
        is_update_data,
        requests_recovery,
        job_data
      FROM ${prefix}qrtz_job_details
    `;

        const params: any[] = [];
        if (filterGroup) {
            query += ' WHERE job_group = $1';
            params.push(filterGroup);
        }

        query += ' ORDER BY job_group, job_name';

        const result = await pool.query(query, params);

        return result.rows.map((row: any) => ({
            schedName: row.sched_name,
            jobName: row.job_name,
            jobGroup: row.job_group,
            description: row.description,
            jobClassName: row.job_class_name,
            isDurable: row.is_durable,
            isNonconcurrent: row.is_nonconcurrent,
            isUpdateData: row.is_update_data,
            requestsRecovery: row.requests_recovery,
            jobData: this.parseJobData(row.job_data)
        }));
    }

    /**
     * Get a specific job by name and group
     */
    async getJob(config: DatabaseConnection, jobName: string, jobGroup: string): Promise<JobDetail | null> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        const query = `
      SELECT 
        sched_name,
        job_name,
        job_group,
        description,
        job_class_name,
        is_durable,
        is_nonconcurrent,
        is_update_data,
        requests_recovery,
        job_data
      FROM ${prefix}qrtz_job_details
      WHERE job_name = $1 AND job_group = $2
    `;

        const result = await pool.query(query, [jobName, jobGroup]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            schedName: row.sched_name,
            jobName: row.job_name,
            jobGroup: row.job_group,
            description: row.description,
            jobClassName: row.job_class_name,
            isDurable: row.is_durable,
            isNonconcurrent: row.is_nonconcurrent,
            isUpdateData: row.is_update_data,
            requestsRecovery: row.requests_recovery,
            jobData: this.parseJobData(row.job_data)
        };
    }

    /**
     * Get all triggers
     */
    async getAllTriggers(config: DatabaseConnection, filterJob?: { jobName: string; jobGroup: string }): Promise<TriggerInfo[]> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        let query = `
      SELECT 
        t.sched_name,
        t.trigger_name,
        t.trigger_group,
        t.job_name,
        t.job_group,
        t.description,
        t.next_fire_time,
        t.prev_fire_time,
        t.priority,
        t.trigger_state,
        t.trigger_type,
        t.start_time,
        t.end_time,
        t.calendar_name,
        t.misfire_instr,
        c.cron_expression,
        c.time_zone_id
      FROM ${prefix}qrtz_triggers t
      LEFT JOIN ${prefix}qrtz_cron_triggers c 
        ON t.sched_name = c.sched_name 
        AND t.trigger_name = c.trigger_name 
        AND t.trigger_group = c.trigger_group
    `;

        const params: any[] = [];
        if (filterJob) {
            query += ' WHERE t.job_name = $1 AND t.job_group = $2';
            params.push(filterJob.jobName, filterJob.jobGroup);
        }

        query += ' ORDER BY t.trigger_group, t.trigger_name';

        const result = await pool.query(query, params);

        return result.rows.map((row: any) => ({
            schedName: row.sched_name,
            triggerName: row.trigger_name,
            triggerGroup: row.trigger_group,
            jobName: row.job_name,
            jobGroup: row.job_group,
            description: row.description,
            nextFireTime: row.next_fire_time ? parseInt(row.next_fire_time) : undefined,
            prevFireTime: row.prev_fire_time ? parseInt(row.prev_fire_time) : undefined,
            priority: row.priority,
            triggerState: row.trigger_state,
            triggerType: row.trigger_type,
            startTime: parseInt(row.start_time),
            endTime: row.end_time ? parseInt(row.end_time) : undefined,
            calendarName: row.calendar_name,
            misfireInstr: row.misfire_instr,
            cronExpression: row.cron_expression,
            timeZoneId: row.time_zone_id
        }));
    }

    /**
     * Get currently executing jobs
     */
    async getExecutingJobs(config: DatabaseConnection): Promise<ExecutingJob[]> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        const query = `
      SELECT 
        sched_name,
        entry_id,
        trigger_name,
        trigger_group,
        instance_name,
        fired_time,
        sched_time,
        priority,
        state,
        job_name,
        job_group,
        is_nonconcurrent,
        requests_recovery
      FROM ${prefix}qrtz_fired_triggers
      ORDER BY fired_time DESC
    `;

        const result = await pool.query(query);

        return result.rows.map((row: any) => ({
            schedName: row.sched_name,
            entryId: row.entry_id,
            triggerName: row.trigger_name,
            triggerGroup: row.trigger_group,
            instanceName: row.instance_name,
            firedTime: parseInt(row.fired_time),
            schedTime: parseInt(row.sched_time),
            priority: row.priority,
            state: row.state,
            jobName: row.job_name,
            jobGroup: row.job_group,
            isNonconcurrent: row.is_nonconcurrent,
            requestsRecovery: row.requests_recovery
        }));
    }

    /**
     * Get scheduler information
     */
    async getSchedulerInfo(config: DatabaseConnection): Promise<SchedulerInfo[]> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        const query = `
      SELECT 
        sched_name,
        instance_name,
        last_checkin_time,
        checkin_interval
      FROM ${prefix}qrtz_scheduler_state
      ORDER BY instance_name
    `;

        const result = await pool.query(query);

        return result.rows.map((row: any) => ({
            schedName: row.sched_name,
            instanceName: row.instance_name,
            lastCheckinTime: parseInt(row.last_checkin_time),
            checkinInterval: parseInt(row.checkin_interval)
        }));
    }

    /**
     * Get scheduler statistics
     */
    async getStatistics(config: DatabaseConnection): Promise<SchedulerStatistics> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        const [jobsResult, triggersResult, executingResult, pausedResult, instancesResult] = await Promise.all([
            pool.query(`SELECT COUNT(*) as count FROM ${prefix}qrtz_job_details`),
            pool.query(`SELECT COUNT(*) as count FROM ${prefix}qrtz_triggers`),
            pool.query(`SELECT COUNT(*) as count FROM ${prefix}qrtz_fired_triggers`),
            pool.query(`SELECT COUNT(*) as count FROM ${prefix}qrtz_triggers WHERE trigger_state = 'PAUSED'`),
            pool.query(`SELECT COUNT(*) as count FROM ${prefix}qrtz_scheduler_state`)
        ]);

        return {
            totalJobs: parseInt(jobsResult.rows[0].count),
            totalTriggers: parseInt(triggersResult.rows[0].count),
            executingJobs: parseInt(executingResult.rows[0].count),
            pausedTriggers: parseInt(pausedResult.rows[0].count),
            schedulerInstances: parseInt(instancesResult.rows[0].count)
        };
    }

    /**
     * Parse job data from bytea format
     */
    private parseJobData(jobData: Buffer | null): Record<string, any> | undefined {
        if (!jobData || jobData.length === 0) {
            return undefined;
        }

        // For now, return empty object - parsing Java serialized objects is complex
        // In a real implementation, you'd need to deserialize the Java object
        return {};
    }

    /**
     * Delete a job
     */
    async deleteJob(config: DatabaseConnection, jobName: string, jobGroup: string): Promise<boolean> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        // Delete triggers first (foreign key constraint)
        await pool.query(
            `DELETE FROM ${prefix}qrtz_triggers WHERE job_name = $1 AND job_group = $2`,
            [jobName, jobGroup]
        );

        // Delete job
        const result = await pool.query(
            `DELETE FROM ${prefix}qrtz_job_details WHERE job_name = $1 AND job_group = $2`,
            [jobName, jobGroup]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Pause a trigger
     */
    async pauseTrigger(config: DatabaseConnection, triggerName: string, triggerGroup: string): Promise<boolean> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        const result = await pool.query(
            `UPDATE ${prefix}qrtz_triggers SET trigger_state = 'PAUSED' 
       WHERE trigger_name = $1 AND trigger_group = $2 AND trigger_state != 'PAUSED'`,
            [triggerName, triggerGroup]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Resume a trigger
     */
    async resumeTrigger(config: DatabaseConnection, triggerName: string, triggerGroup: string): Promise<boolean> {
        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        const result = await pool.query(
            `UPDATE ${prefix}qrtz_triggers SET trigger_state = 'WAITING' 
       WHERE trigger_name = $1 AND trigger_group = $2 AND trigger_state = 'PAUSED'`,
            [triggerName, triggerGroup]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Validate cron expression
     */
    validateCronExpression(cronExpression: string): { valid: boolean; error?: string; readable?: string } {
        try {
            // Use cronstrue to validate and get readable format
            const readable = cronstrue.toString(cronExpression);
            return {
                valid: true,
                readable
            };
        } catch (error: any) {
            return {
                valid: false,
                error: error.message || 'Invalid cron expression'
            };
        }
    }

    /**
     * Parse cron expression to human-readable format
     */
    parseCronExpression(cronExpression: string): string {
        try {
            return cronstrue.toString(cronExpression);
        } catch (error) {
            return cronExpression;
        }
    }



    /**
     * Update trigger cron expression
     */
    async updateTriggerCronExpression(
        config: DatabaseConnection,
        triggerName: string,
        triggerGroup: string,
        newCronExpression: string
    ): Promise<boolean> {
        // Validate cron expression first
        const validation = this.validateCronExpression(newCronExpression);
        if (!validation.valid) {
            throw new Error(`Invalid cron expression: ${validation.error}`);
        }

        const pool = await connectionManager.getPool(config);
        const prefix = this.getSchemaPrefix(config.schema);

        // Update cron expression in qrtz_cron_triggers
        const cronResult = await pool.query(
            `UPDATE ${prefix}qrtz_cron_triggers 
       SET cron_expression = $1 
       WHERE trigger_name = $2 AND trigger_group = $3`,
            [newCronExpression, triggerName, triggerGroup]
        );

        if (cronResult.rowCount === 0) {
            throw new Error('Trigger not found or is not a cron trigger');
        }

        // Let Quartz scheduler recalculate next_fire_time itself
        // We'll just mark to ensure the trigger is re-evaluated
        await pool.query(
            `UPDATE ${prefix}qrtz_triggers 
       SET next_fire_time = 0 
       WHERE trigger_name = $1 AND trigger_group = $2`,
            [triggerName, triggerGroup]
        );

        return true;
    }
}

export const quartzService = new QuartzService();
