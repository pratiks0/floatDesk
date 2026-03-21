# FloatDesk v2 — Floating Timer & Sticky Notes for Windows

A compact, always-on-top desktop widget. Lives in the corner of your screen, stays out of the way.

---

## Features

| Feature | Details |
|---|---|
| **Countdown timer** | Presets (5/15/25/45/60 min) + custom h:mm:ss input |
| **Stopwatch** | With lap recording |
| **Progress ring** | Amber at 20% left, red + pulse at zero |
| **Minimize to pill** | Shrinks to a 180×44px pill showing live timer — click ↑ to restore |
| **Dynamic size** | Slider from 75% to 140% — resizes the window live |
| **Sticky notes** | Persistent — survive app restarts, stored in your user profile |
| **6 note colours** | Yellow, teal, pink, blue, amber, purple |
| **Colour picker per note** | Change a note's colour after creation |
| **Note search** | Filter notes live by title or body |
| **Always on top** | Stays over every window including fullscreen |
| **System tray** | Click tray icon to show/hide — right-click to quit |
| **Drag to reposition** | Drag the title bar anywhere |

---

## Requirements

- **Windows 10 or 11** (64-bit)
- **Node.js 18 LTS or newer** → https://nodejs.org/en/download
  - During install: check "Add to PATH" when prompted
- **Git** (optional, only needed if you clone instead of unzipping)

Check your versions in a terminal:
```
node --version    # should print v18.x.x or higher
npm --version     # should print 9.x or higher
```

---

## Quick Start (run from source)

```bash
# 1. Unzip the project and open a terminal inside the floatdesk folder
cd floatdesk

# 2. Install dependencies (only needed once)
npm install

# 3. Run
npm start
```

The widget appears in the bottom-right corner. Drag the title bar to move it.

---

## Build a Windows .exe

### Option A — Portable .exe (no install needed, just double-click)
```bash
npm run build:portable
```
Output: `dist/FloatDesk-Portable.exe`  
Send this single file to anyone — no install required.

### Option B — Installer .exe (installs to AppData, adds Start Menu shortcut)
```bash
npm run build:installer
```
Output: `dist/FloatDesk Setup 2.0.0.exe`

### Option C — Build both at once
```bash
npm run build
```

> **First build takes 3–10 minutes** — electron-builder downloads the Electron runtime (~100MB). Subsequent builds are fast.

---

## Auto-start with Windows

**Method 1 — Startup folder** (easiest)
1. Press `Win + R`, type `shell:startup`, press Enter
2. Copy a shortcut to `FloatDesk-Portable.exe` (or the installed `FloatDesk.exe`) into that folder
3. Done — it launches on every login

**Method 2 — Task Scheduler** (more control, no UAC prompt)
1. Open Task Scheduler → Create Basic Task
2. Trigger: "When I log on"
3. Action: Start a program → browse to your `FloatDesk.exe`
4. Check "Run only when user is logged on"

---

## Where notes are saved

Notes are saved to:
```
C:\Users\<YourName>\AppData\Roaming\floatdesk\floatdesk-notes.json
```
This file is created automatically on first run.  
It survives app updates, reinstalls, and restarts.  
You can back it up or sync it with OneDrive/Dropbox.

---

## Customisation

All UI lives in `index.html` (no build step needed for UI changes).  
All window/tray logic is in `main.js`.

### Change default window position
`main.js` → `getDefaultPos()`:
```js
function getDefaultPos() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { x: width - FULL_W - 20, y: height - FULL_H - 20 };
  // Top-left corner: return { x: 20, y: 20 };
}
```

### Change default size constants
```js
const FULL_W = 320;   // main window width
const FULL_H = 480;   // main window height
const MINI_W = 180;   // pill width when minimized
const MINI_H = 44;    // pill height when minimized
```

### Change timer presets
`index.html` → `.presets` section:
```html
<button class="pre" onclick="setPre(this, 10)">10m</button>
```

### Change note colours (dark theme values)
`index.html` → CSS `.note-card.{color}` rules.

---

## Project structure
```
floatdesk/
├── main.js            ← Electron main process
│                         window management, tray, IPC, resize
├── index.html         ← Main widget UI
│                         timer (countdown+stopwatch), notes, size slider
├── mini.html          ← Pill UI shown when minimized
│                         live timer display, restore button
├── package.json       ← npm + electron-builder config
├── assets/
│   └── icon.ico       ← App icon (replace with 256×256 .ico)
└── README.md
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `electron` not found after `npm install` | Run `npm install` again inside the project folder |
| Build fails with ENOENT on icon.ico | Make sure `assets/icon.ico` exists — even a placeholder works |
| Notes not persisting | Check `%APPDATA%\floatdesk\` folder exists and is writable |
| Fonts look wrong | Need internet connection first run (Google Fonts cache) |
| Window not on top over games | Some DRM/anti-cheat blocks always-on-top — expected |
| Pill doesn't show timer | Make sure timer is running before clicking minimize |
| `npm run build` is slow | Normal on first run — Electron (~100MB) is being downloaded |

---

## Making your own icon

The bundled icon is a minimal placeholder. To replace it:
1. Create a 256×256 PNG with your design
2. Convert to `.ico` using https://convertio.co/png-ico/ (select 16, 32, 48, 256px)
3. Replace `assets/icon.ico`
4. Rebuild with `npm run build`
