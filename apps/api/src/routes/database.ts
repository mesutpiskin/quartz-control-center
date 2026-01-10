import { Router } from 'express';
import { connectionManager } from '../db/connectionManager';
import { schemaService } from '../services/schemaService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateConnection } from '../middleware/validateConnection';
import { DatabaseConnection } from '../db/databaseTypes';

const router = Router();

/**
 * Test database connection
 * POST /api/database/test-connection
 */
router.post('/test-connection', asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body;

    const result = await connectionManager.testConnection(connection);

    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
}));

/**
 * List all schemas
 * POST /api/database/schemas
 */
router.post('/schemas', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;

    const schemas = await schemaService.listSchemas(connection);

    res.json({ schemas });
}));

/**
 * Get schemas with Quartz table information
 * POST /api/database/schemas-with-quartz
 */
router.post('/schemas-with-quartz', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;

    const schemaInfos = await schemaService.getSchemasWithQuartzInfo(connection);

    res.json({ schemas: schemaInfos });
}));

/**
 * Validate Quartz tables in a schema
 * POST /api/database/validate-quartz
 */
router.post('/validate-quartz', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { schema } = req.body;

    if (!schema) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Schema name is required'
        });
    }

    const validation = await schemaService.validateQuartzTables(connection, schema);

    res.json(validation);
}));

/**
 * Get table statistics
 * POST /api/database/table-counts
 */
router.post('/table-counts', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { schema } = req.body;

    if (!schema) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Schema name is required'
        });
    }

    const counts = await schemaService.getTableCounts(connection, schema);

    res.json(counts);
}));

export default router;
