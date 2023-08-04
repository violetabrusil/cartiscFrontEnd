const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    doSomething: () => ipcRenderer.send('do-something')
  }
)
