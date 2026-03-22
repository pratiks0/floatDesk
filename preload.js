const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fd', {

  // Notes — async via main process (which has full fs access)
  loadNotes:  ()    => ipcRenderer.invoke('load-notes'),
  saveNotes:  (arr) => ipcRenderer.send('save-notes', arr),

  // Window control
  hideApp:        ()     => ipcRenderer.send('hide-window'),
  resizeWindow:   (data) => ipcRenderer.send('resize-window', data),
  minimizeToMini: (data) => ipcRenderer.send('minimize-to-mini', data),
  timerTick:      (data) => ipcRenderer.send('timer-tick', data),

});
