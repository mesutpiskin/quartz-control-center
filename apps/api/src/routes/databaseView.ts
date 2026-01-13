import { Router } from 'express';
import { quartzService } from '../services/quartzService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateConnection } from '../middleware/validateConnection';
import { DatabaseConnection } from '../db/databaseTypes';

const router = Router();

/**
 * Get all Quartz tables with row counts
 * POST /api/database-view/tables
 */
router.post('/tables', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;

    const tables = await quartzService.getQuartzTables(connection);

    res.json({ tables });
}));

/**
 * Get paginated table data
 * POST /api/database-view/table-data
 */
router.post('/table-data', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { tableName, page = 1, pageSize = 50 } = req.body;

    if (!tableName) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Table name is required'
        });
    }

    const result = await quartzService.getTableData(connection, tableName, page, pageSize);

    res.json(result);
}));

/**
 * Get table column schema
 * POST /api/database-view/table-schema
 */
router.post('/table-schema', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { tableName } = req.body;

    if (!tableName) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Table name is required'
        });
    }

    const schema = await quartzService.getTableSchema(connection, tableName);

    res.json({ columns: schema });
}));

export default router;
