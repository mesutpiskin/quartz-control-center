import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import databaseRoutes from './routes/database';
import jobRoutes from './routes/jobs';
import triggerRoutes from './routes/triggers';
import schedulerRoutes from './routes/scheduler';
import { errorHandler } from './middleware/errorHandler';
import { connectionManager } from './db/connectionManager';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/database', databaseRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Quartz Control Center API'
    });
});

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Quartz Control Center API',
        version: '1.0.0',
        endpoints: {
            database: '/api/database',
            jobs: '/api/jobs',
            triggers: '/api/triggers',
            scheduler: '/api/scheduler',
            health: '/health'
        }
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connections...');
    await connectionManager.closeAllPools();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connections...');
    await connectionManager.closeAllPools();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Quartz Control Center API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

export default app;
