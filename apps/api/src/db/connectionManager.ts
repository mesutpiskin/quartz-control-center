import { DatabaseConnection, DatabaseType, ConnectionTestResult } from './databaseTypes';
import { IDatabaseAdapter } from './adapters/IDatabaseAdapter';
import { PostgresAdapter } from './adapters/postgresAdapter';
import { MssqlAdapter } from './adapters/mssqlAdapter';
import { MysqlAdapter } from './adapters/mysqlAdapter';

/**
 * Connection Manager for dynamic database connections
 * Supports PostgreSQL, SQL Server, and MySQL
 */
class ConnectionManager {
    private pools: Map<string, any> = new Map();
    private adapters: Map<DatabaseType, IDatabaseAdapter> = new Map();

    constructor() {
        // Register database adapters
        this.adapters.set(DatabaseType.POSTGRESQL, new PostgresAdapter());
        this.adapters.set(DatabaseType.SQL_SERVER, new MssqlAdapter());
        this.adapters.set(DatabaseType.MYSQL, new MysqlAdapter());
    }

    /**
     * Get adapter for database type
     */
    private getAdapter(databaseType: DatabaseType): IDatabaseAdapter {
        const adapter = this.adapters.get(databaseType);
        if (!adapter) {
            throw new Error(`Database type ${databaseType} is not supported`);
        }
        return adapter;
    }

    /**
     * Create a connection key from connection parameters
     */
    private createConnectionKey(config: DatabaseConnection): string {
        return `${config.databaseType}:${config.host}:${config.port}:${config.database}:${config.username}`;
    }

    /**
     * Get or create a connection pool
     */
    async getPool(config: DatabaseConnection): Promise<any> {
        const key = this.createConnectionKey(config);

        if (this.pools.has(key)) {
            return this.pools.get(key)!;
        }

        const adapter = this.getAdapter(config.databaseType);
        const pool = await adapter.createPool(config);

        this.pools.set(key, pool);
        return pool;
    }

    /**
     * Execute query using appropriate adapter
     */
    async query(config: DatabaseConnection, sql: string, params?: any[]): Promise<any> {
        const pool = await this.getPool(config);
        const adapter = this.getAdapter(config.databaseType);
        return adapter.query(pool, sql, params);
    }

    /**
     * Test database connection
     */
    async testConnection(config: DatabaseConnection): Promise<ConnectionTestResult> {
        try {
            const adapter = this.getAdapter(config.databaseType);
            return await adapter.testConnection(config);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                message: `Connection test failed: ${errorMessage}`,
            };
        }
    }

    /**
     * Close a specific pool
     */
    async closePool(config: DatabaseConnection): Promise<void> {
        const key = this.createConnectionKey(config);
        const pool = this.pools.get(key);

        if (pool) {
            const adapter = this.getAdapter(config.databaseType);
            await adapter.closePool(pool);
            this.pools.delete(key);
        }
    }

    /**
     * Close all pools
     */
    async closeAllPools(): Promise<void> {
        const closePromises: Promise<void>[] = [];

        for (const [key, pool] of this.pools.entries()) {
            // Extract database type from key
            const dbType = key.split(':')[0] as DatabaseType;
            const adapter = this.getAdapter(dbType);
            closePromises.push(adapter.closePool(pool));
        }

        await Promise.all(closePromises);
        this.pools.clear();
    }

    /**
     * Get adapter for external use (e.g., for queries in services)
     */
    getAdapterForType(databaseType: DatabaseType): IDatabaseAdapter {
        return this.getAdapter(databaseType);
    }
}

export const connectionManager = new ConnectionManager();
