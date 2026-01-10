import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface DatabaseConnection {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    schema?: string;
    databaseType: 'postgresql' | 'sqlserver' | 'mysql';
}

interface ApiRequestWithConnection {
    connection: DatabaseConnection;
    [key: string]: any;
}

// Helper to create request body with connection
export const withConnection = (connection: DatabaseConnection, data?: any): ApiRequestWithConnection => ({
    connection,
    ...data,
});
