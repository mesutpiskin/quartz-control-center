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
 * List all jobs
 * POST /api/jobs/list
 */
router.post('/list', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { filterGroup } = req.body;
    const jobs = yield quartzService_1.quartzService.getAllJobs(connection, filterGroup);
    res.json({ jobs });
})));
/**
 * Get job details
 * POST /api/jobs/detail
 */
router.post('/detail', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { jobName, jobGroup } = req.body;
    if (!jobName || !jobGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'jobName and jobGroup are required'
        });
    }
    const job = yield quartzService_1.quartzService.getJob(connection, jobName, jobGroup);
    if (!job) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Job ${jobGroup}.${jobName} not found`
        });
    }
    res.json({ job });
})));
/**
 * Delete a job
 * POST /api/jobs/delete
 */
router.post('/delete', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { jobName, jobGroup } = req.body;
    if (!jobName || !jobGroup) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'jobName and jobGroup are required'
        });
    }
    const deleted = yield quartzService_1.quartzService.deleteJob(connection, jobName, jobGroup);
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
})));
exports.default = router;
