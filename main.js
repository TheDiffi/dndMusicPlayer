// Modules to control application life and create native browser window
const path = require('path')
const glob = require('glob')
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const shell = require('electron').shell;

var mainWin;


function initialize() {
  loadScripts();

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    mainWin = createWindow()

    mainWin.on('close', () => {
      app.quit()
    })


    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

}

function createWindow() {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()


  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          label: 'new Window',
          click() {
            createWindow();
          }
        }
      ]
    },
    
  ]);
  Menu.setApplicationMenu(menu);

  return mainWindow;
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Require each JS file in the main-process dir
function loadScripts() {
  const files = glob.sync(path.join(__dirname, 'src/*.js'))
  files.forEach((file) => { require(file) })
}






initialize()
