"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quartzService_1 = require("../services/quartzService");
const errorHandler_1 = require("../middleware/errorHandler");
const validateConnection_1 = require("../middleware/validateConnection");
const router = (0, express_1.Router)();
/**
 * List all triggers
 * POST /api/triggers/list
 */
router.post('/list', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { jobName, jobGroup } = req.body;
    const filterJob = jobName && jobGroup ? { jobName, jobGroup } : undefined;
    const triggers = yield quartzService_1.quartzService.getAllTriggers(connection, filterJob);
    res.json({ triggers });
})));
/**
 * Get currently executing jobs
 * POST /api/triggers/executing
 */
router.post('/executing', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const executingJobs = yield quartzService_1.quartzService.getExecutingJobs(connection);
    res.json({ executingJobs });
})));
/**
 * Pause a trigger
 * POST /api/triggers/pause
 */
router.post('/pause', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { triggerName, triggerGroup } = req.body;
    if (!triggerName || !triggerGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'triggerName and triggerGroup are required'
        });
    }
    const paused = yield quartzService_1.quartzService.pauseTrigger(connection, triggerName, triggerGroup);
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
})));
/**
 * Resume a trigger
 * POST /api/triggers/resume
 */
router.post('/resume', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { triggerName, triggerGroup } = req.body;
    if (!triggerName || !triggerGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'triggerName and triggerGroup are required'
        });
    }
    const resumed = yield quartzService_1.quartzService.resumeTrigger(connection, triggerName, triggerGroup);
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
})));
/**
 * Update trigger cron expression
 * POST /api/triggers/update
 */
router.post('/update', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { triggerName, triggerGroup, cronExpression } = req.body;
    if (!triggerName || !triggerGroup || !cronExpression) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'triggerName, triggerGroup, and cronExpression are required'
        });
    }
    try {
        yield quartzService_1.quartzService.updateTriggerCronExpression(connection, triggerName, triggerGroup, cronExpression);
        res.json({
            success: true,
            message: `Trigger ${triggerGroup}.${triggerName} updated successfully`
        });
    }
    catch (error) {
        res.status(400).json({
            error: 'Update Failed',
            message: error.message
        });
    }
})));
/**
 * Validate cron expression
 * POST /api/triggers/validate-cron
 */
router.post('/validate-cron', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cronExpression } = req.body;
    if (!cronExpression) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'cronExpression is required'
        });
    }
    const validation = quartzService_1.quartzService.validateCronExpression(cronExpression);
    res.json(validation);
})));
exports.default = router;
