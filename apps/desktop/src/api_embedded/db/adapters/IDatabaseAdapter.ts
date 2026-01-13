import { DatabaseConnection } from '../databaseTypes';

/**
 * Generic database adapter interface
 * Abstracts differences between database systems
 */
export interface IDatabaseAdapter {
    /**
     * Create a connection/pool
     */
    createPool(config: DatabaseConnection): Promise<any>;

    /**
     * Execute a query
     */
    query(pool: any, sql: string, params?: any[]): Promise<any>;

    /**
     * Test connection
     */
    testConnection(config: DatabaseConnection): Promise<{
        success: boolean;
        message: string;
        serverVersion?: string;
    }>;

    /**
     * Close pool/connection
     */
    closePool(pool: any): Promise<void>;

    /**
     * Get version query
     */
    getVersionQuery(): string;

    /**
     * Get schema list query
     */
    getSchemaListQuery(): string;

    /**
     * Get tables in schema query
     */
    getTablesInSchemaQuery(schema: string): string;

    /**
     * Adapt LIMIT clause
     */
    adaptLimitClause(limit: number): string;
}
