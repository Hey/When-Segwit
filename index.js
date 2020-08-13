// Import modules.
const {app, BrowserWindow} = require('electron');
const path = require('path');

// Disable security warnigns.
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Initializes program.
function createWindow () {

  // Create the window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './assets/preload.js'),
      enableRemoteModule: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Disable default tool bar.
  mainWindow.setMenuBarVisibility(false)

  // Open the dev tools for testing.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // Initialize window.
  createWindow()
  
  // Upon full load.
  app.on('activate', function () {
    
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Fixes bug.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})