const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1400,
    minHeight: 900,
    title: "Cartics",
    resizable: false,
    icon: path.join(__dirname, 'icons/mac/cartics-logo-only.icns'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: 1.0,
    }
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (input.key === '+' || input.key === '=' || input.key === '-') {
        event.preventDefault();
      }
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  });

  // Siempre carga desde el contenedor Docker persistente (nginx sirviendo el build en :3000),
  // asi funciona igual sin importar si el proyecto se corrio con npm start o no.
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.on('closed', function () {
    mainWindow = null
  })

}
app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
