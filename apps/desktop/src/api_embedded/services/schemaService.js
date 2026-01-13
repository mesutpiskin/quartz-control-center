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
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaService = exports.SchemaService = void 0;
const connectionManager_1 = require("../db/connectionManager");
/**
 * Service for schema detection and Quartz table validation
 */
class SchemaService {
    constructor() {
        this.REQUIRED_QUARTZ_TABLES = [
            'qrtz_job_details',
            'qrtz_triggers',
            'qrtz_simple_triggers',
            'qrtz_cron_triggers',
            'qrtz_simprop_triggers',
            'qrtz_blob_triggers',
            'qrtz_fired_triggers',
            'qrtz_calendars',
            'qrtz_paused_trigger_grps',
            'qrtz_scheduler_state',
            'qrtz_locks'
        ];
    }
    /**
     * List all schemas in the database
     */
    listSchemas(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const query = `
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `;
            const result = yield pool.query(query);
            return result.rows.map((row) => row.schema_name);
        });
    }
    /**
     * Detect Quartz tables in a specific schema
     */
    detectQuartzTables(config, schemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 
        AND table_name LIKE 'qrtz_%'
      ORDER BY table_name
    `;
            const result = yield pool.query(query, [schemaName]);
            return result.rows.map((row) => row.table_name);
        });
    }
    /**
     * Get schema information including Quartz table detection
     */
    getSchemasWithQuartzInfo(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const schemas = yield this.listSchemas(config);
            const schemaInfos = [];
            for (const schema of schemas) {
                const quartzTables = yield this.detectQuartzTables(config, schema);
                schemaInfos.push({
                    schemaName: schema,
                    hasQuartzTables: quartzTables.length > 0,
                    quartzTables
                });
            }
            return schemaInfos;
        });
    }
    /**
     * Validate that all required Quartz tables exist in the schema
     */
    validateQuartzTables(config, schemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingTables = yield this.detectQuartzTables(config, schemaName);
            const existingTableSet = new Set(existingTables.map(t => t.toLowerCase()));
            const missingTables = this.REQUIRED_QUARTZ_TABLES.filter(table => !existingTableSet.has(table.toLowerCase()));
            return {
                valid: missingTables.length === 0,
                missingTables,
                existingTables
            };
        });
    }
    /**
     * Get table row counts for statistics
     */
    getTableCounts(config, schemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield connectionManager_1.connectionManager.getPool(config);
            const counts = {};
            const tables = ['qrtz_job_details', 'qrtz_triggers', 'qrtz_fired_triggers'];
            for (const table of tables) {
                try {
                    const query = `SELECT COUNT(*) as count FROM ${schemaName}.${table}`;
                    const result = yield pool.query(query);
                    counts[table] = parseInt(result.rows[0].count, 10);
                }
                catch (error) {
                    counts[table] = 0;
                }
            }
            return counts;
        });
    }
}
exports.SchemaService = SchemaService;
exports.schemaService = new SchemaService();
