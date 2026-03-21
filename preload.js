const { contextBridge, ipcRenderer } = require('electron');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const NOTES_FILE = path.join(os.homedir(), 'floatdesk-notes.json');

contextBridge.exposeInMainWorld('fd', {

  minimizeToMini: function(data) {
    try { ipcRenderer.send('minimize-to-mini', data); } catch(e) {}
  },

  resizeWindow: function(data) {
    try { ipcRenderer.send('resize-window', data); } catch(e) {}
  },

  // fire-and-forget — never throws even if mini window is closed
  timerTick: function(data) {
    try { ipcRenderer.send('timer-tick', data); } catch(e) {}
  },

  loadNotes: function() {
    try {
      if (fs.existsSync(NOTES_FILE))
        return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
    } catch(e) {}
    return null;
  },

  saveNotes: function(arr) {
    try { fs.writeFileSync(NOTES_FILE, JSON.stringify(arr, null, 2), 'utf8'); } catch(e) {}
  },

});
