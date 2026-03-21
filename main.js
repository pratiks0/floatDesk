const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let win     = null;
let miniWin = null;
let tray    = null;

// Base dimensions (100% zoom)
const BASE_W = 320;
const BASE_H = 480;
const MINI_W = 180;
const MINI_H = 44;

function defaultPos(w, h) {
  const wa = screen.getPrimaryDisplay().workAreaSize;
  return { x: wa.width - w - 20, y: wa.height - h - 20 };
}

function createMainWindow(w, h) {
  if (win && !win.isDestroyed()) return;
  w = w || BASE_W;
  h = h || BASE_H;
  const pos = defaultPos(w, h);
  win = new BrowserWindow({
    width: w, height: h, x: pos.x, y: pos.y,
    minWidth: 240, minHeight: 360,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
  win.setAlwaysOnTop(true, 'screen-saver');
  win.on('closed', () => { win = null; });
}

function createMiniWindow(x, y) {
  if (miniWin && !miniWin.isDestroyed()) miniWin.close();
  miniWin = new BrowserWindow({
    width: MINI_W, height: MINI_H, x, y,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    skipTaskbar: true, hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-mini.js'),
    },
  });
  miniWin.loadFile('mini.html');
  miniWin.setAlwaysOnTop(true, 'screen-saver');
  miniWin.on('closed', () => { miniWin = null; });
}

function createTray() {
  // Empty 1x1 transparent icon — safe fallback on all Windows builds
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('FloatDesk');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show FloatDesk', click() { showMain(); } },
    { label: 'Hide to Tray',   click() { win && win.hide(); } },
    { type: 'separator' },
    { label: 'Quit',           click() { app.quit(); } },
  ]));
  tray.on('click', () => win && win.isVisible() ? win.hide() : showMain());
}

function showMain() {
  if (!win || win.isDestroyed()) createMainWindow();
  else { win.show(); win.focus(); }
  if (miniWin && !miniWin.isDestroyed()) miniWin.close();
}

app.whenReady().then(() => { createMainWindow(); createTray(); });
app.on('window-all-closed', () => { /* stay in tray */ });

// ── IPC ──────────────────────────────────────────────
ipcMain.on('hide-window', () => { win && win.hide(); });

ipcMain.on('resize-window', (_, { width, height }) => {
  if (!win || win.isDestroyed()) return;
  const [cx, cy] = win.getPosition();
  win.setBounds({ x: cx, y: cy, width: Math.round(width), height: Math.round(height) });
});

ipcMain.on('minimize-to-mini', (_, payload) => {
  if (!win || win.isDestroyed()) return;
  const [wx, wy] = win.getPosition();
  const [, wh]   = win.getSize();
  win.hide();
  createMiniWindow(wx, wy + wh - MINI_H);
  miniWin.webContents.once('did-finish-load', () => {
    if (miniWin && !miniWin.isDestroyed())
      miniWin.webContents.send('mini-init', payload);
  });
});

ipcMain.on('restore-from-mini', () => {
  showMain();
});

ipcMain.on('timer-tick', (_, data) => {
  if (miniWin && !miniWin.isDestroyed())
    miniWin.webContents.send('timer-tick', data);
});
