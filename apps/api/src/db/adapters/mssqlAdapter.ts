import * as mssql from 'mssql';
import { DatabaseConnection } from '../databaseTypes';
import { IDatabaseAdapter } from './IDatabaseAdapter';

/**
 * SQL Server Database Adapter
 */
export class MssqlAdapter implements IDatabaseAdapter {
    async createPool(config: DatabaseConnection): Promise<mssql.ConnectionPool> {
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

        await pool.connect();
        return pool;
    }

    async query(pool: mssql.ConnectionPool, sql: string, params?: any[]): Promise<any> {
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

        const result = await request.query(sql);
        return result.recordset;
    }

    async testConnection(config: DatabaseConnection) {
        let pool: mssql.ConnectionPool | null = null;

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

            await pool.connect();
            const result = await pool.request().query(this.getVersionQuery());
            const version = result.recordset[0]?.version || 'Unknown';

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
            if (pool) {
                await pool.close();
            }
        }
    }

    async closePool(pool: mssql.ConnectionPool): Promise<void> {
        await pool.close();
    }

    getVersionQuery(): string {
        return "SELECT @@VERSION as version";
    }

    getSchemaListQuery(): string {
        return `
            SELECT SCHEMA_NAME as schema_name
            FROM INFORMATION_SCHEMA.SCHEMATA
            WHERE SCHEMA_NAME NOT IN ('guest', 'INFORMATION_SCHEMA', 'sys', 'db_owner', 'db_accessadmin', 
                                      'db_securityadmin', 'db_ddladmin', 'db_backupoperator', 'db_datareader', 
                                      'db_datawriter', 'db_denydatareader', 'db_denydatawriter')
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
        // SQL Server uses TOP instead of LIMIT
        return `TOP ${limit}`;
    }
}
