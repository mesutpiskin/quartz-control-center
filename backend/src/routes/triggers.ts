import { Router } from 'express';
import { quartzService } from '../services/quartzService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateConnection } from '../middleware/validateConnection';
import { DatabaseConnection } from '../db/databaseTypes';

const router = Router();

/**
 * List all triggers
 * POST /api/triggers/list
 */
router.post('/list', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { jobName, jobGroup } = req.body;

    const filterJob = jobName && jobGroup ? { jobName, jobGroup } : undefined;
    const triggers = await quartzService.getAllTriggers(connection, filterJob);

    res.json({ triggers });
}));

/**
 * Get currently executing jobs
 * POST /api/triggers/executing
 */
router.post('/executing', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;

    const executingJobs = await quartzService.getExecutingJobs(connection);

    res.json({ executingJobs });
}));

/**
 * Pause a trigger
 * POST /api/triggers/pause
 */
router.post('/pause', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { triggerName, triggerGroup } = req.body;

    if (!triggerName || !triggerGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'triggerName and triggerGroup are required'
        });
    }

    const paused = await quartzService.pauseTrigger(connection, triggerName, triggerGroup);

    if (!paused) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Trigger ${triggerGroup}.${triggerName} not found or already paused`
        });
    }

    res.json({
        success: true,
        message: `Trigger ${triggerGroup}.${triggerName} paused successfully`
    });
}));

/**
 * Resume a trigger
 * POST /api/triggers/resume
 */
router.post('/resume', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { triggerName, triggerGroup } = req.body;

    if (!triggerName || !triggerGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'triggerName and triggerGroup are required'
        });
    }

    const resumed = await quartzService.resumeTrigger(connection, triggerName, triggerGroup);

    if (!resumed) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Trigger ${triggerGroup}.${triggerName} not found or not paused`
        });
    }

    res.json({
        success: true,
        message: `Trigger ${triggerGroup}.${triggerName} resumed successfully`
    });
}));

export default router;
