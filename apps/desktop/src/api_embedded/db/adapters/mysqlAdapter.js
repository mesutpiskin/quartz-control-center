"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.MysqlAdapter = void 0;
const mysql = __importStar(require("mysql2/promise"));
/**
 * MySQL Database Adapter
 */
class MysqlAdapter {
    createPool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = mysql.createPool({
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.username,
                password: config.password,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0,
            });
            return pool;
        });
    }
    query(pool, sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield pool.execute(sql, params);
            return rows;
        });
    }
    testConnection(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let connection = null;
            try {
                connection = yield mysql.createConnection({
                    host: config.host,
                    port: config.port,
                    database: config.database,
                    user: config.username,
                    password: config.password,
                    connectTimeout: 5000,
                });
                const [rows] = yield connection.execute(this.getVersionQuery());
                const version = ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.version) || 'Unknown';
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
                if (connection) {
                    yield connection.end();
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
        return 'SELECT VERSION() as version';
    }
    getSchemaListQuery() {
        return `
            SELECT SCHEMA_NAME as schema_name
            FROM INFORMATION_SCHEMA.SCHEMATA
            WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
            ORDER BY SCHEMA_NAME
        `;
    }
    getTablesInSchemaQuery(schema) {
        return `
            SELECT TABLE_NAME as table_name
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = '${schema}'
            AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `;
    }
    adaptLimitClause(limit) {
        return `LIMIT ${limit}`;
    }
}
exports.MysqlAdapter = MysqlAdapter;
