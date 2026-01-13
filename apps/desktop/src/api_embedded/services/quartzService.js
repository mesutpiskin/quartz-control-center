"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quartzService = exports.QuartzService = void 0;
const connectionManager_1 = require("../db/connectionManager");
const cronstrue_1 = __importDefault(require("cronstrue"));
/**
 * Service for Quartz job operations using direct SQL queries
 */
class QuartzService {
    getSchemaPrefix(schema) {
        return schema ? `${schema}.` : '';
    }
    /**
     * Get all jobs from QRTZ_JOB_DETAILS
     */
    getAllJobs(config, filterGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
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
            const params = [];
            if (filterGroup) {
                query += ' WHERE job_group = $1';
                params.push(filterGroup);
            }
            query += ' ORDER BY job_group, job_name';
            const result = yield pool.query(query, params);
            return result.rows.map((row) => ({
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
        });
    }
    /**
     * Get a specific job by name and group
     */
    getJob(config, jobName, jobGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
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
            const result = yield pool.query(query, [jobName, jobGroup]);
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
        });
    }
    /**
     * Get all triggers
     */
    getAllTriggers(config, filterJob) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
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
            const params = [];
            if (filterJob) {
                query += ' WHERE t.job_name = $1 AND t.job_group = $2';
                params.push(filterJob.jobName, filterJob.jobGroup);
            }
            query += ' ORDER BY t.trigger_group, t.trigger_name';
            const result = yield pool.query(query, params);
            return result.rows.map((row) => ({
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
        });
    }
    /**
     * Get currently executing jobs
     */
    getExecutingJobs(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
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
            const result = yield pool.query(query);
            return result.rows.map((row) => ({
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
        });
    }
    /**
     * Get scheduler information
     */
    getSchedulerInfo(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
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
            const result = yield pool.query(query);
            return result.rows.map((row) => ({
                schedName: row.sched_name,
                instanceName: row.instance_name,
                lastCheckinTime: parseInt(row.last_checkin_time),
                checkinInterval: parseInt(row.checkin_interval)
            }));
        });
    }
    /**
     * Get scheduler statistics
     */
    getStatistics(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const prefix = this.getSchemaPrefix(config.schema);
            const [jobsResult, triggersResult, executingResult, pausedResult, instancesResult] = yield Promise.all([
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
        });
    }
    /**
     * Parse job data from bytea format
     */
    parseJobData(jobData) {
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
    deleteJob(config, jobName, jobGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const prefix = this.getSchemaPrefix(config.schema);
            // Delete triggers first (foreign key constraint)
            yield pool.query(`DELETE FROM ${prefix}qrtz_triggers WHERE job_name = $1 AND job_group = $2`, [jobName, jobGroup]);
            // Delete job
            const result = yield pool.query(`DELETE FROM ${prefix}qrtz_job_details WHERE job_name = $1 AND job_group = $2`, [jobName, jobGroup]);
            return result.rowCount !== null && result.rowCount > 0;
        });
    }
    /**
     * Pause a trigger
     */
    pauseTrigger(config, triggerName, triggerGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const prefix = this.getSchemaPrefix(config.schema);
            const result = yield pool.query(`UPDATE ${prefix}qrtz_triggers SET trigger_state = 'PAUSED' 
       WHERE trigger_name = $1 AND trigger_group = $2 AND trigger_state != 'PAUSED'`, [triggerName, triggerGroup]);
            return result.rowCount !== null && result.rowCount > 0;
        });
    }
    /**
     * Resume a trigger
     */
    resumeTrigger(config, triggerName, triggerGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const prefix = this.getSchemaPrefix(config.schema);
            const result = yield pool.query(`UPDATE ${prefix}qrtz_triggers SET trigger_state = 'WAITING' 
       WHERE trigger_name = $1 AND trigger_group = $2 AND trigger_state = 'PAUSED'`, [triggerName, triggerGroup]);
            return result.rowCount !== null && result.rowCount > 0;
        });
    }
    /**
     * Validate cron expression
     */
    validateCronExpression(cronExpression) {
        try {
            // Use cronstrue to validate and get readable format
            const readable = cronstrue_1.default.toString(cronExpression);
            return {
                valid: true,
                readable
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error.message || 'Invalid cron expression'
            };
        }
    }
    /**
     * Parse cron expression to human-readable format
     */
    parseCronExpression(cronExpression) {
        try {
            return cronstrue_1.default.toString(cronExpression);
        }
        catch (error) {
            return cronExpression;
        }
    }
    /**
     * Update trigger cron expression
     */
    updateTriggerCronExpression(config, triggerName, triggerGroup, newCronExpression) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate cron expression first
            const validation = this.validateCronExpression(newCronExpression);
            if (!validation.valid) {
                throw new Error(`Invalid cron expression: ${validation.error}`);
            }
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const prefix = this.getSchemaPrefix(config.schema);
            // Update cron expression in qrtz_cron_triggers
            const cronResult = yield pool.query(`UPDATE ${prefix}qrtz_cron_triggers 
       SET cron_expression = $1 
       WHERE trigger_name = $2 AND trigger_group = $3`, [newCronExpression, triggerName, triggerGroup]);
            if (cronResult.rowCount === 0) {
                throw new Error('Trigger not found or is not a cron trigger');
            }
            // Let Quartz scheduler recalculate next_fire_time itself
            // We'll just mark to ensure the trigger is re-evaluated
            yield pool.query(`UPDATE ${prefix}qrtz_triggers 
       SET next_fire_time = 0 
       WHERE trigger_name = $1 AND trigger_group = $2`, [triggerName, triggerGroup]);
            return true;
        });
    }
    /**
     * Get all Quartz tables with row counts
     */
    getQuartzTables(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const prefix = this.getSchemaPrefix(config.schema);
            const schemaName = config.schema || 'public';
            // Get all tables that start with qrtz_
            const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = $1 
              AND table_name LIKE 'qrtz_%'
            ORDER BY table_name
        `;
            const tablesResult = yield pool.query(tablesQuery, [schemaName]);
            const tables = [];
            // Table descriptions
            const descriptions = {
                'qrtz_job_details': 'Job definitions and configurations',
                'qrtz_triggers': 'Trigger configurations and schedules',
                'qrtz_simple_triggers': 'Simple trigger details',
                'qrtz_cron_triggers': 'Cron expression triggers',
                'qrtz_simprop_triggers': 'Simple property triggers',
                'qrtz_blob_triggers': 'Binary large object triggers',
                'qrtz_fired_triggers': 'Currently executing jobs',
                'qrtz_calendars': 'Calendar definitions',
                'qrtz_paused_trigger_grps': 'Paused trigger groups',
                'qrtz_scheduler_state': 'Scheduler instance states',
                'qrtz_locks': 'Scheduler locks'
            };
            for (const row of tablesResult.rows) {
                const tableName = row.table_name;
                try {
                    const countQuery = `SELECT COUNT(*) as count FROM ${prefix}${tableName}`;
                    const countResult = yield pool.query(countQuery);
                    const rowCount = parseInt(countResult.rows[0].count, 10);
                    tables.push({
                        name: tableName,
                        rowCount,
                        description: descriptions[tableName] || 'Quartz table'
                    });
                }
                catch (error) {
                    // If count fails, still include the table with 0 count
                    tables.push({
                        name: tableName,
                        rowCount: 0,
                        description: descriptions[tableName] || 'Quartz table'
                    });
                }
            }
            return tables;
        });
    }
    /**
     * Get paginated table data
     */
    getTableData(config_1, tableName_1) {
        return __awaiter(this, arguments, void 0, function* (config, tableName, page = 1, pageSize = 50) {
            // Validate table name (must start with qrtz_)
            if (!tableName.startsWith('qrtz_')) {
                throw new Error('Invalid table name. Only Quartz tables (qrtz_*) are allowed.');
            }
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const prefix = this.getSchemaPrefix(config.schema);
            const offset = (page - 1) * pageSize;
            // Get total count
            const countQuery = `SELECT COUNT(*) as count FROM ${prefix}${tableName}`;
            const countResult = yield pool.query(countQuery);
            const total = parseInt(countResult.rows[0].count, 10);
            // Get paginated data
            const dataQuery = `SELECT * FROM ${prefix}${tableName} LIMIT $1 OFFSET $2`;
            const dataResult = yield pool.query(dataQuery, [pageSize, offset]);
            return {
                data: dataResult.rows,
                total,
                page,
                pageSize
            };
        });
    }
    /**
     * Get table column schema information
     */
    getTableSchema(config, tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate table name (must start with qrtz_)
            if (!tableName.startsWith('qrtz_')) {
                throw new Error('Invalid table name. Only Quartz tables (qrtz_*) are allowed.');
            }
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const schemaName = config.schema || 'public';
            const query = `
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = $1 
              AND table_name = $2
            ORDER BY ordinal_position
        `;
            const result = yield pool.query(query, [schemaName, tableName]);
            return result.rows.map((row) => ({
                name: row.column_name,
                type: row.data_type,
                nullable: row.is_nullable === 'YES',
                default: row.column_default
            }));
        });
    }
}
exports.QuartzService = QuartzService;
exports.quartzService = new QuartzService();
