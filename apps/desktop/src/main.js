const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const log = require('electron-log');

let mainWindow;
let apiProcess;
let tray;

const API_PORT = 3001;
const WEB_PORT = 3000;

// Logging configuration
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, '../../../assets/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'default',
        show: false
    });

    // Show window when ready to avoid flickering
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Load the app
    mainWindow.loadURL(`http://localhost:${WEB_PORT}`);

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle minimize to tray
    mainWindow.on('minimize', (event) => {
        if (process.platform === 'darwin') {
            return; // macOS handles this differently
        }
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createTray() {
    const iconPath = process.platform === 'darwin'
        ? path.join(__dirname, '../../../assets/icon-tray.png')
        : path.join(__dirname, '../../../assets/icon.png');

    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Quartz Control Center');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.show();
    });
}

function startBackend() {
    return new Promise((resolve, reject) => {
        const apiPath = path.join(__dirname, '../../api/dist/index.js');

        log.info('Starting backend API...');
        log.info('API path:', apiPath);

        apiProcess = spawn('node', [apiPath], {
            env: {
                ...process.env,
                PORT: API_PORT,
                NODE_ENV: 'production',
                CORS_ORIGIN: `http://localhost:${WEB_PORT}`
            },
            stdio: 'pipe'
        });

        apiProcess.stdout.on('data', (data) => {
            log.info('[API]', data.toString());
        });

        apiProcess.stderr.on('data', (data) => {
            log.error('[API Error]', data.toString());
        });

        apiProcess.on('error', (error) => {
            log.error('Failed to start API:', error);
            reject(error);
        });

        apiProcess.on('exit', (code) => {
            log.info(`API process exited with code ${code}`);
        });

        // Wait a bit for the server to start
        setTimeout(() => {
            log.info('Backend API started on port', API_PORT);
            resolve();
        }, 2000);
    });
}

function startFrontend() {
    return new Promise((resolve, reject) => {
        const webPath = path.join(__dirname, '../../web/.next/standalone/server.js');

        log.info('Starting frontend server...');
        log.info('Web path:', webPath);

        const webProcess = spawn('node', [webPath], {
            env: {
                ...process.env,
                PORT: WEB_PORT,
                NODE_ENV: 'production',
                NEXT_PUBLIC_API_URL: `http://localhost:${API_PORT}`
            },
            stdio: 'pipe'
        });

        webProcess.stdout.on('data', (data) => {
            log.info('[Web]', data.toString());
        });

        webProcess.stderr.on('data', (data) => {
            log.error('[Web Error]', data.toString());
        });

        webProcess.on('error', (error) => {
            log.error('Failed to start web server:', error);
            reject(error);
        });

        // Wait for server to start
        setTimeout(() => {
            log.info('Frontend server started on port', WEB_PORT);
            resolve();
        }, 3000);
    });
}

app.whenReady().then(async () => {
    try {
        // Start backend API
        await startBackend();

        // Start frontend server
        await startFrontend();

        // Create app window
        createWindow();

        // Create system tray
        createTray();

        log.info('Application started successfully');
    } catch (error) {
        log.error('Failed to start application:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('will-quit', () => {
    // Kill backend process
    if (apiProcess) {
        log.info('Stopping backend API...');
        apiProcess.kill();
    }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
});
