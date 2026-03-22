const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

let win     = null;
let miniWin = null;
let tray    = null;

const BASE_W = 320;
const BASE_H = 480;
const MINI_W = 180;
const MINI_H = 44;

const NOTES_FILE = path.join(os.homedir(), 'floatdesk-notes.json');

// ── Notes I/O (main process — full fs access) ────────────
function readNotes() {
  try {
    if (fs.existsSync(NOTES_FILE))
      return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
  } catch(e) {}
  return null;
}

function writeNotes(data) {
  try { fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2), 'utf8'); }
  catch(e) { console.error('[FloatDesk] save failed:', e.message); }
}

// ── Window helpers ───────────────────────────────────────
function workArea() { return screen.getPrimaryDisplay().workAreaSize; }

function createMainWindow(w, h) {
  if (win && !win.isDestroyed()) return;
  w = w || BASE_W; h = h || BASE_H;
  const wa = workArea();
  win = new BrowserWindow({
    width: w, height: h,
    x: wa.width  - w - 20,
    y: wa.height - h - 20,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    skipTaskbar: true, hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,            // lets preload use require() for IPC only
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
      sandbox: false,
      preload: path.join(__dirname, 'preload-mini.js'),
    },
  });
  miniWin.loadFile('mini.html');
  miniWin.setAlwaysOnTop(true, 'screen-saver');
  miniWin.on('closed', () => { miniWin = null; });
}

function showMain() {
  if (!win || win.isDestroyed()) createMainWindow();
  else { win.show(); win.focus(); }
  if (miniWin && !miniWin.isDestroyed()) miniWin.close();
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('FloatDesk');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show FloatDesk', click: showMain },
    { label: 'Hide to Tray',   click: () => win && win.hide() },
    { type: 'separator' },
    { label: 'Quit',           click: () => app.quit() },
  ]));
  tray.on('click', () => win && win.isVisible() ? win.hide() : showMain());
}

app.whenReady().then(() => { createMainWindow(); createTray(); });
app.on('window-all-closed', () => { /* stay in tray */ });

// ── IPC handlers ─────────────────────────────────────────
ipcMain.handle('load-notes', () => readNotes());
ipcMain.on('save-notes', (_, data) => writeNotes(data));

ipcMain.on('hide-window', () => win && win.hide());

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

ipcMain.on('restore-from-mini', () => showMain());

ipcMain.on('timer-tick', (_, data) => {
  if (miniWin && !miniWin.isDestroyed())
    miniWin.webContents.send('timer-tick', data);
});
