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
 * Get scheduler information
 * POST /api/scheduler/info
 */
router.post('/info', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const schedulerInfo = yield quartzService_1.quartzService.getSchedulerInfo(connection);
    res.json({ schedulerInfo });
})));
/**
 * Get scheduler statistics
 * POST /api/scheduler/statistics
 */
router.post('/statistics', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const statistics = yield quartzService_1.quartzService.getStatistics(connection);
    res.json({ statistics });
})));
exports.default = router;
