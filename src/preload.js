const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('globalAPI', {
    isDesktop: true,
    newWindow: (data) => ipcRenderer.send('new-window', data),
    minimize: data => ipcRenderer.send('minimize-main', data),
    maximize: data => ipcRenderer.send('maximize-main', data),
    restore: data => ipcRenderer.send('restore-main', data),
    closeMain: data => ipcRenderer.send('close-main', data),
})
