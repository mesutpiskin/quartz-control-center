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
exports.connectionManager = void 0;
const databaseTypes_1 = require("./databaseTypes");
const postgresAdapter_1 = require("./adapters/postgresAdapter");
const mssqlAdapter_1 = require("./adapters/mssqlAdapter");
const mysqlAdapter_1 = require("./adapters/mysqlAdapter");
/**
 * Connection Manager for dynamic database connections
 * Supports PostgreSQL, SQL Server, and MySQL
 */
class ConnectionManager {
    constructor() {
        this.pools = new Map();
        this.adapters = new Map();
        // Register database adapters
        this.adapters.set(databaseTypes_1.DatabaseType.POSTGRESQL, new postgresAdapter_1.PostgresAdapter());
        this.adapters.set(databaseTypes_1.DatabaseType.SQL_SERVER, new mssqlAdapter_1.MssqlAdapter());
        this.adapters.set(databaseTypes_1.DatabaseType.MYSQL, new mysqlAdapter_1.MysqlAdapter());
    }
    /**
     * Get adapter for database type
     */
    getAdapter(databaseType) {
        const adapter = this.adapters.get(databaseType);
        if (!adapter) {
            throw new Error(`Database type ${databaseType} is not supported`);
        }
        return adapter;
    }
    /**
     * Create a connection key from connection parameters
     */
    createConnectionKey(config) {
        return `${config.databaseType}:${config.host}:${config.port}:${config.database}:${config.username}`;
    }
    /**
     * Get or create a connection pool
     */
    getPool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.createConnectionKey(config);
            if (this.pools.has(key)) {
                return this.pools.get(key);
            }
            const adapter = this.getAdapter(config.databaseType);
            const pool = yield adapter.createPool(config);
            this.pools.set(key, pool);
            return pool;
        });
    }
    /**
     * Execute query using appropriate adapter
     */
    query(config, sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield this.getPool(config);
            const adapter = this.getAdapter(config.databaseType);
            return adapter.query(pool, sql, params);
        });
    }
    /**
     * Test database connection
     */
    testConnection(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adapter = this.getAdapter(config.databaseType);
                return yield adapter.testConnection(config);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    success: false,
                    message: `Connection test failed: ${errorMessage}`,
                };
            }
        });
    }
    /**
     * Close a specific pool
     */
    closePool(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.createConnectionKey(config);
            const pool = this.pools.get(key);
            if (pool) {
                const adapter = this.getAdapter(config.databaseType);
                yield adapter.closePool(pool);
                this.pools.delete(key);
            }
        });
    }
    /**
     * Close all pools
     */
    closeAllPools() {
        return __awaiter(this, void 0, void 0, function* () {
            const closePromises = [];
            for (const [key, pool] of this.pools.entries()) {
                // Extract database type from key
                const dbType = key.split(':')[0];
                const adapter = this.getAdapter(dbType);
                closePromises.push(adapter.closePool(pool));
            }
            yield Promise.all(closePromises);
            this.pools.clear();
        });
    }
    /**
     * Get adapter for external use (e.g., for queries in services)
     */
    getAdapterForType(databaseType) {
        return this.getAdapter(databaseType);
    }
}
exports.connectionManager = new ConnectionManager();
