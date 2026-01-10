import { Router } from 'express';
import { quartzService } from '../services/quartzService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateConnection } from '../middleware/validateConnection';
import { DatabaseConnection } from '../db/databaseTypes';

const router = Router();

/**
 * List all jobs
 * POST /api/jobs/list
 */
router.post('/list', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { filterGroup } = req.body;

    const jobs = await quartzService.getAllJobs(connection, filterGroup);

    res.json({ jobs });
}));

/**
 * Get job details
 * POST /api/jobs/detail
 */
router.post('/detail', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { jobName, jobGroup } = req.body;

    if (!jobName || !jobGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'jobName and jobGroup are required'
        });
    }

    const job = await quartzService.getJob(connection, jobName, jobGroup);

    if (!job) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Job ${jobGroup}.${jobName} not found`
        });
    }

    res.json({ job });
}));

/**
 * Delete a job
 * POST /api/jobs/delete
 */
router.post('/delete', validateConnection, asyncHandler(async (req: any, res: any) => {
    const connection: DatabaseConnection = req.body.connection;
    const { jobName, jobGroup } = req.body;

    if (!jobName || !jobGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'jobName and jobGroup are required'
        });
    }

    const deleted = await quartzService.deleteJob(connection, jobName, jobGroup);

    if (!deleted) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Job ${jobGroup}.${jobName} not found`
        });
    }

    res.json({
        success: true,
        message: `Job ${jobGroup}.${jobName} deleted successfully`
    });
}));

export default router;
