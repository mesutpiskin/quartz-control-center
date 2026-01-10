import { Request, Response, NextFunction } from 'express';
import { DatabaseConnection } from '../db/databaseTypes';

/**
 * Middleware to validate connection parameters in request body
 */
export const validateConnection = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const connection: DatabaseConnection = req.body.connection;

    if (!connection) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Connection configuration is required in request body'
        });
    }

    const { host, port, database, username, password, databaseType } = connection;

    if (!host || !port || !database || !username || !password || !databaseType) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'All connection parameters are required: host, port, database, username, password, databaseType'
        });
    }

    if (typeof port !== 'number' || port < 1 || port > 65535) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Port must be a number between 1 and 65535'
        });
    }

    next();
};
