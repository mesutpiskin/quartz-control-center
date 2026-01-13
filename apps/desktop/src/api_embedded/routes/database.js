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
const connectionManager_1 = require("../db/connectionManager");
const schemaService_1 = require("../services/schemaService");
const errorHandler_1 = require("../middleware/errorHandler");
const validateConnection_1 = require("../middleware/validateConnection");
const router = (0, express_1.Router)();
/**
 * Test database connection
 * POST /api/database/test-connection
 */
router.post('/test-connection', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body;
    const result = yield connectionManager_1.connectionManager.testConnection(connection);
    if (result.success) {
        res.json(result);
    }
    else {
        res.status(400).json(result);
    }
})));
/**
 * List all schemas
 * POST /api/database/schemas
 */
router.post('/schemas', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const schemas = yield schemaService_1.schemaService.listSchemas(connection);
    res.json({ schemas });
})));
/**
 * Get schemas with Quartz table information
 * POST /api/database/schemas-with-quartz
 */
router.post('/schemas-with-quartz', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const schemaInfos = yield schemaService_1.schemaService.getSchemasWithQuartzInfo(connection);
    res.json({ schemas: schemaInfos });
})));
/**
 * Validate Quartz tables in a schema
 * POST /api/database/validate-quartz
 */
router.post('/validate-quartz', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { schema } = req.body;
    if (!schema) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Schema name is required'
        });
    }
    const validation = yield schemaService_1.schemaService.validateQuartzTables(connection, schema);
    res.json(validation);
})));
/**
 * Get table statistics
 * POST /api/database/table-counts
 */
router.post('/table-counts', validateConnection_1.validateConnection, (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = req.body.connection;
    const { schema } = req.body;
    if (!schema) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Schema name is required'
        });
    }
    const counts = yield schemaService_1.schemaService.getTableCounts(connection, schema);
    res.json(counts);
})));
exports.default = router;
