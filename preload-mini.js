const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fd', {
  restoreApp()     { ipcRenderer.send('restore-from-mini'); },
  onMiniInit(cb)   { ipcRenderer.on('mini-init',  (_, d) => cb(d)); },
  onTimerTick(cb)  { ipcRenderer.on('timer-tick', (_, d) => cb(d)); },
});
