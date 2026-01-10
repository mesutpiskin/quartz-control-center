/**
 * Database connection configuration
 */
export interface DatabaseConnection {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    schema?: string;
    databaseType: DatabaseType;
}

/**
 * Supported database types
 */
export enum DatabaseType {
    POSTGRESQL = 'postgresql',
    SQL_SERVER = 'sqlserver',
    MYSQL = 'mysql'
}

/**
 * Schema information
 */
export interface SchemaInfo {
    schemaName: string;
    hasQuartzTables: boolean;
    quartzTables: string[];
}

/**
 * Database connection test result
 */
export interface ConnectionTestResult {
    success: boolean;
    message: string;
    serverVersion?: string;
}

/**
 * Quartz table validation result
 */
export interface QuartzValidationResult {
    valid: boolean;
    missingTables: string[];
    existingTables: string[];
}
