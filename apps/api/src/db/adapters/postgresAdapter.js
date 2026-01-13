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
exports.PostgresAdapter = void 0;
const pg_1 = require("pg");
/**
 * PostgreSQL Database Adapter
 */
class PostgresAdapter {
    createPool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool({
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.username,
                password: config.password,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
            });
            // Set schema if provided
            if (config.schema) {
                pool.on('connect', (client) => {
                    client.query(`SET search_path TO ${config.schema}`).catch(err => {
                        console.error('Error setting schema:', err);
                    });
                });
            }
            return pool;
        });
    }
    query(pool, sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(sql, params);
            return result.rows;
        });
    }
    testConnection(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let pool = null;
            let client = null;
            try {
                pool = new pg_1.Pool({
                    host: config.host,
                    port: config.port,
                    database: config.database,
                    user: config.username,
                    password: config.password,
                    connectionTimeoutMillis: 5000,
                });
                client = yield pool.connect();
                const result = yield client.query(this.getVersionQuery());
                const version = ((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.version) || 'Unknown';
                return {
                    success: true,
                    message: 'Connection successful',
                    serverVersion: version,
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    success: false,
                    message: `Connection failed: ${errorMessage}`,
                };
            }
            finally {
                if (client) {
                    client.release();
                }
                if (pool) {
                    yield pool.end();
                }
            }
        });
    }
    closePool(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.end();
        });
    }
    getVersionQuery() {
        return 'SELECT version()';
    }
    getSchemaListQuery() {
        return `
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
            ORDER BY schema_name
        `;
    }
    getTablesInSchemaQuery(schema) {
        return `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${schema}' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `;
    }
    adaptLimitClause(limit) {
        return `LIMIT ${limit}`;
    }
}
exports.PostgresAdapter = PostgresAdapter;
