const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;
let tray = null;

const PORT = process.env.PORT || 3000;
const SERVER_URL = `http://localhost:${PORT}`;

function startBackendServer() {
  console.log('[Electron] Starting local backend server...');
  const serverPath = path.join(__dirname, '../dist/server/index.js');
  
  try {
    // In production package, run the compiled server directly
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'inherit'
    });

    serverProcess.on('error', (err) => {
      console.warn('[Electron] spawn error, attempting node fallback:', err.message);
      serverProcess = spawn('node', [serverPath], {
        env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production' },
        stdio: 'inherit'
      });
    });
  } catch (err) {
    console.error('[Electron] Error starting server process:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'KobeanAI Tracker',
    backgroundColor: '#090d16',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Retry loading until Express server on PORT is ready
  let attempts = 0;
  const loadApp = () => {
    mainWindow.loadURL(SERVER_URL).catch(() => {
      attempts++;
      if (attempts < 15) {
        setTimeout(loadApp, 500);
      }
    });
  };

  loadApp();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    console.log('[Electron] Terminating local backend server...');
    serverProcess.kill();
  }
});
