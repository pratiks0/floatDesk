# FloatDesk — One-Click Setup

## One-time setup (do this once only)

1. Copy the entire `floatdesk-v2` folder anywhere you want, e.g.:
   ```
   C:\Users\YourName\FloatDesk\
   ```

2. Copy `launch.bat` into that same folder so it sits next to `main.js`

3. Double-click `launch.bat` once — it will auto-install dependencies (~1 min)

4. FloatDesk appears on screen. Done.

---

## Make a desktop shortcut (click once from desktop)

1. Right-click `launch.bat` → **Send to → Desktop (create shortcut)**
2. Right-click the new shortcut on desktop → **Properties**
3. Change **Run** dropdown to `Minimized` (so the terminal window flashes away instantly)
4. Click **Change Icon** → browse to `assets\icon.ico` for a nicer icon
5. Click OK

Now just double-click the desktop shortcut — FloatDesk opens, no terminal visible.

---

## Auto-start with Windows (optional)

To make FloatDesk launch every time you log in:

1. Press **Win + R**, type `shell:startup`, press Enter
2. Copy your desktop shortcut into that folder
3. Done — it will start automatically on every login

---

## Pinning to Taskbar

Right-click the desktop shortcut → **Pin to taskbar**
Then one click from taskbar launches FloatDesk.
