import { Pool, PoolClient } from 'pg';
import { DatabaseConnection, DatabaseType, ConnectionTestResult } from './databaseTypes';

/**
 * Connection Manager for dynamic database connections
 * Manages PostgreSQL connection pools
 */
class ConnectionManager {
    private pools: Map<string, Pool> = new Map();

    /**
     * Create a connection key from connection parameters
     */
    private createConnectionKey(config: DatabaseConnection): string {
        return `${config.host}:${config.port}:${config.database}:${config.username}`;
    }

    /**
     * Get or create a connection pool
     */
    async getPool(config: DatabaseConnection): Promise<Pool> {
        if (config.databaseType !== DatabaseType.POSTGRESQL) {
            throw new Error(`Database type ${config.databaseType} is not yet supported`);
        }

        const key = this.createConnectionKey(config);

        if (this.pools.has(key)) {
            return this.pools.get(key)!;
        }

        const pool = new Pool({
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
            pool.on('connect', (client: PoolClient) => {
                client.query(`SET search_path TO ${config.schema}`).catch(err => {
                    console.error('Error setting schema:', err);
                });
            });
        }

        this.pools.set(key, pool);
        return pool;
    }

    /**
     * Test database connection
     */
    async testConnection(config: DatabaseConnection): Promise<ConnectionTestResult> {
        let pool: Pool | null = null;
        let client: PoolClient | null = null;

        try {
            pool = new Pool({
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.username,
                password: config.password,
                connectionTimeoutMillis: 5000,
            });

            client = await pool.connect();
            const result = await client.query('SELECT version()');
            const version = result.rows[0]?.version || 'Unknown';

            return {
                success: true,
                message: 'Connection successful',
                serverVersion: version,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                message: `Connection failed: ${errorMessage}`,
            };
        } finally {
            if (client) {
                client.release();
            }
            if (pool) {
                await pool.end();
            }
        }
    }

    /**
     * Close a specific pool
     */
    async closePool(config: DatabaseConnection): Promise<void> {
        const key = this.createConnectionKey(config);
        const pool = this.pools.get(key);

        if (pool) {
            await pool.end();
            this.pools.delete(key);
        }
    }

    /**
     * Close all pools
     */
    async closeAllPools(): Promise<void> {
        const closePromises = Array.from(this.pools.values()).map(pool => pool.end());
        await Promise.all(closePromises);
        this.pools.clear();
    }
}

export const connectionManager = new ConnectionManager();
