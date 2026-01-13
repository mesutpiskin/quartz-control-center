import * as mysql from 'mysql2/promise';
import { DatabaseConnection } from '../databaseTypes';
import { IDatabaseAdapter } from './IDatabaseAdapter';

/**
 * MySQL Database Adapter
 */
export class MysqlAdapter implements IDatabaseAdapter {
    async createPool(config: DatabaseConnection): Promise<mysql.Pool> {
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
    }

    async query(pool: mysql.Pool, sql: string, params?: any[]): Promise<any> {
        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    async testConnection(config: DatabaseConnection) {
        let connection: mysql.Connection | null = null;

        try {
            connection = await mysql.createConnection({
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.username,
                password: config.password,
                connectTimeout: 5000,
            });

            const [rows] = await connection.execute(this.getVersionQuery());
            const version = (rows as any)[0]?.version || 'Unknown';

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
            if (connection) {
                await connection.end();
            }
        }
    }

    async closePool(pool: mysql.Pool): Promise<void> {
        await pool.end();
    }

    getVersionQuery(): string {
        return 'SELECT VERSION() as version';
    }

    getSchemaListQuery(): string {
        return `
            SELECT SCHEMA_NAME as schema_name
            FROM INFORMATION_SCHEMA.SCHEMATA
            WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
            ORDER BY SCHEMA_NAME
        `;
    }

    getTablesInSchemaQuery(schema: string): string {
        return `
            SELECT TABLE_NAME as table_name
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = '${schema}'
            AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `;
    }

    adaptLimitClause(limit: number): string {
        return `LIMIT ${limit}`;
    }
}
