import { Router } from 'express';
import { quartzService } from '../services/quartzService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateConnection } from '../middleware/validateConnection';
import { DatabaseConnection } from '../db/databaseTypes';

const router = Router();

/**
 * Get scheduler information
 * POST /api/scheduler/info
 */
router.post('/info', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;

    const schedulerInfo = await quartzService.getSchedulerInfo(connection);

    res.json({ schedulerInfo });
}));

/**
 * Get scheduler statistics
 * POST /api/scheduler/statistics
 */
router.post('/statistics', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;

    const statistics = await quartzService.getStatistics(connection);

    res.json({ statistics });
}));

export default router;
