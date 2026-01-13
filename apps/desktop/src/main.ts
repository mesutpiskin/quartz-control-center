import { app, BrowserWindow, protocol } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import databaseRoutes from './api_embedded/routes/database';
import jobRoutes from './api_embedded/routes/jobs';
import triggerRoutes from './api_embedded/routes/triggers';
import schedulerRoutes from './api_embedded/routes/scheduler';
import databaseViewRoutes from './api_embedded/routes/databaseView';
import { errorHandler } from './api_embedded/middleware/errorHandler';
import { connectionManager } from './api_embedded/db/connectionManager';

// --- API Server Setup ---
const apiApp = express();
const API_PORT = 3001;

// Load environment variables if needed (though mostly static in desktop)
dotenv.config();

apiApp.use(cors({ origin: true, credentials: true }));
apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: true }));

// Register Routes
apiApp.use('/api/database', databaseRoutes);
apiApp.use('/api/jobs', jobRoutes);
apiApp.use('/api/triggers', triggerRoutes);
apiApp.use('/api/scheduler', schedulerRoutes);
apiApp.use('/api/database-view', databaseViewRoutes);

apiApp.get('/health', (_req, res) => {
    res.json({ status: 'OK', service: 'Quartz Control Center Desktop API' });
});

// Move API info to /api to free up root for React app
apiApp.get('/api', (_req, res) => {
  res.json({
      name: 'Quartz Control Center API',
      version: '1.0.0',
      supportedDatabases: ['PostgreSQL', 'SQL Server', 'MySQL'],
      endpoints: {
          database: '/api/database',
          jobs: '/api/jobs',
          triggers: '/api/triggers',
          scheduler: '/api/scheduler',
          databaseView: '/api/database-view',
          health: '/health'
      }
  });
});

apiApp.use(errorHandler);

// --- Serve Static Frontend ---
// Serve the 'dist-web' folder as static files
const distWebPath = path.join(__dirname, '../dist-web');
apiApp.use(express.static(distWebPath));

// Handle SPA routing: return index.html for any unknown non-API routes
apiApp.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API Endpoint Not Found' });
    }
    res.sendFile(path.join(distWebPath, 'index.html'));
});

const startApiServer = () => {
    return new Promise<void>((resolve) => {
        apiApp.listen(API_PORT, () => {
            console.log(`Internal API server running on port ${API_PORT}`);
            resolve();
        });
    });
};

// --- Electron Setup ---
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../build/icon.png'),
    });

    if (isDev) {
        // In dev, load from the Next.js dev server
        await mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load from the internal express server
        await mainWindow.loadURL(`http://localhost:${API_PORT}`);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    await startApiServer();
    createWindow();
});

app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    // Clean up DB connections
    await connectionManager.closeAllPools();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
