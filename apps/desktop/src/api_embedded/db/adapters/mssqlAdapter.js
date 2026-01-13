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
exports.MssqlAdapter = void 0;
const mssql = __importStar(require("mssql"));
/**
 * SQL Server Database Adapter
 */
class MssqlAdapter {
    createPool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new mssql.ConnectionPool({
                server: config.host,
                port: config.port,
                database: config.database,
                user: config.username,
                password: config.password,
                options: {
                    encrypt: false, // Yerel development için
                    trustServerCertificate: true,
                    enableArithAbort: true,
                },
                pool: {
                    max: 10,
                    min: 0,
                    idleTimeoutMillis: 30000,
                },
            });
            yield pool.connect();
            return pool;
        });
    }
    query(pool, sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = pool.request();
            // Parametreleri ekle
            if (params) {
                params.forEach((param, index) => {
                    request.input(`param${index}`, param);
                });
                // SQL'deki ? işaretlerini @param0, @param1 ile değiştir
                let adaptedSql = sql;
                params.forEach((_, index) => {
                    adaptedSql = adaptedSql.replace('?', `@param${index}`);
                });
                sql = adaptedSql;
            }
            const result = yield request.query(sql);
            return result.recordset;
        });
    }
    testConnection(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let pool = null;
            try {
                pool = new mssql.ConnectionPool({
                    server: config.host,
                    port: config.port,
                    database: config.database,
                    user: config.username,
                    password: config.password,
                    options: {
                        encrypt: false,
                        trustServerCertificate: true,
                    },
                    connectionTimeout: 5000,
                });
                yield pool.connect();
                const result = yield pool.request().query(this.getVersionQuery());
                const version = ((_a = result.recordset[0]) === null || _a === void 0 ? void 0 : _a.version) || 'Unknown';
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
                if (pool) {
                    yield pool.close();
                }
            }
        });
    }
    closePool(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.close();
        });
    }
    getVersionQuery() {
        return "SELECT @@VERSION as version";
    }
    getSchemaListQuery() {
        return `
            SELECT SCHEMA_NAME as schema_name
            FROM INFORMATION_SCHEMA.SCHEMATA
            WHERE SCHEMA_NAME NOT IN ('guest', 'INFORMATION_SCHEMA', 'sys', 'db_owner', 'db_accessadmin', 
                                      'db_securityadmin', 'db_ddladmin', 'db_backupoperator', 'db_datareader', 
                                      'db_datawriter', 'db_denydatareader', 'db_denydatawriter')
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
        // SQL Server uses TOP instead of LIMIT
        return `TOP ${limit}`;
    }
}
exports.MssqlAdapter = MssqlAdapter;
