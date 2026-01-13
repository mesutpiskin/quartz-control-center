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
 * Get all Quartz tables with row counts
 * POST /api/database-view/tables
 */
router.post('/tables', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const tables = yield quartzService_1.quartzService.getQuartzTables(connection);
    res.json({ tables });
})));
/**
 * Get paginated table data
 * POST /api/database-view/table-data
 */
router.post('/table-data', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { tableName, page = 1, pageSize = 50 } = req.body;
    if (!tableName) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Table name is required'
        });
    }
    const result = yield quartzService_1.quartzService.getTableData(connection, tableName, page, pageSize);
    res.json(result);
})));
/**
 * Get table column schema
 * POST /api/database-view/table-schema
 */
router.post('/table-schema', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { tableName } = req.body;
    if (!tableName) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Table name is required'
        });
    }
    const schema = yield quartzService_1.quartzService.getTableSchema(connection, tableName);
    res.json({ columns: schema });
})));
exports.default = router;
