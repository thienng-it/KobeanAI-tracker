const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;

const PORT = process.env.PORT || 3000;
const SERVER_URL = `http://localhost:${PORT}`;

// Helper to check if backend server is responsive
function checkServerHealth() {
  return new Promise((resolve) => {
    const req = http.get(`${SERVER_URL}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startBackendServer() {
  const isHealthy = await checkServerHealth();
  if (isHealthy) {
    console.log('[Electron] Existing KobeanAI backend server detected on port', PORT);
    return;
  }

  console.log('[Electron] Spawning local backend server on port', PORT);
  
  // Find server entry file
  const candidateServerPaths = [
    path.join(__dirname, '../dist/server/index.js'),
    path.join(process.resourcesPath || '', 'app/dist/server/index.js'),
  ];
  
  const serverPath = candidateServerPaths.find(p => require('fs').existsSync(p)) || candidateServerPaths[0];
  console.log('[Electron] Server entry path:', serverPath);

  // Spawn node process
  serverProcess = spawn('node', [serverPath], {
    env: { 
      ...process.env, 
      PORT: PORT.toString(), 
      NODE_ENV: 'production' 
    },
    stdio: 'inherit'
  });

  serverProcess.on('error', (err) => {
    console.error('[Electron] Failed to start backend server:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log('[Electron] Backend server exited with code:', code);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    title: 'KobeanAI Tracker',
    backgroundColor: '#090d16',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    show: false, // Don't show until content is ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Retry polling until backend is fully up
  let attempts = 0;
  const pollAndLoad = async () => {
    const isHealthy = await checkServerHealth();
    if (isHealthy) {
      console.log('[Electron] Backend ready! Loading application URL:', SERVER_URL);
      mainWindow.loadURL(SERVER_URL);
    } else {
      attempts++;
      if (attempts < 30) {
        setTimeout(pollAndLoad, 400);
      } else {
        console.warn('[Electron] Backend server timed out. Attempting direct load.');
        mainWindow.loadURL(SERVER_URL);
      }
    }
  };

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.warn(`[Electron] Page failed to load (${errorCode}: ${errorDescription}), retrying...`);
    setTimeout(pollAndLoad, 1000);
  });

  pollAndLoad();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startBackendServer();
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
    console.log('[Electron] Terminating local backend server process...');
    serverProcess.kill();
  }
});
