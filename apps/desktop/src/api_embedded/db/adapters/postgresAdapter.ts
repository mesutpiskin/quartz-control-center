import { Pool, PoolClient } from 'pg';
import { DatabaseConnection } from '../databaseTypes';
import { IDatabaseAdapter } from './IDatabaseAdapter';

/**
 * PostgreSQL Database Adapter
 */
export class PostgresAdapter implements IDatabaseAdapter {
    async createPool(config: DatabaseConnection): Promise<Pool> {
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

        return pool;
    }

    async query(pool: Pool, sql: string, params?: any[]): Promise<any> {
        const result = await pool.query(sql, params);
        return result.rows;
    }

    async testConnection(config: DatabaseConnection) {
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
            const result = await client.query(this.getVersionQuery());
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

    async closePool(pool: Pool): Promise<void> {
        await pool.end();
    }

    getVersionQuery(): string {
        return 'SELECT version()';
    }

    getSchemaListQuery(): string {
        return `
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
            ORDER BY schema_name
        `;
    }

    getTablesInSchemaQuery(schema: string): string {
        return `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${schema}' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `;
    }

    adaptLimitClause(limit: number): string {
        return `LIMIT ${limit}`;
    }
}
