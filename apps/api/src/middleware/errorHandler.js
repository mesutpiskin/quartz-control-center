"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
/**
 * Global error handler middleware
 */
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    // Database connection errors
    if (err.message.includes('ECONNREFUSED') || err.message.includes('connect ETIMEDOUT')) {
        return res.status(503).json({
            error: 'Database Connection Error',
            message: 'Unable to connect to the database. Please check your connection settings.',
            details: err.message
        });
    }
    // PostgreSQL specific errors
    if (err.message.includes('password authentication failed')) {
        return res.status(401).json({
            error: 'Authentication Error',
            message: 'Invalid database credentials',
            details: err.message
        });
    }
    if (err.message.includes('does not exist')) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'The requested resource does not exist',
            details: err.message
        });
    }
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }
    // Default error
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
exports.errorHandler = errorHandler;
/**
 * Async handler wrapper to catch async errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
