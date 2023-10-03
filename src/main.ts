// Modules to control application life and create native browser window
import path from 'path';
import glob from 'glob';
import { app, BrowserWindow, Menu } from 'electron';
import { shell } from 'electron/common';
import { ipcMain } from 'electron';

export {BrowserWindow, ipcMain, mainWin};

// Enable live reload for all the files inside your project directory
require('electron-reload')(__dirname);

const indexFilepath = "../section/index.html"; 
let mainWin;

function initialize() {
  loadScripts()

  function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 800,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    // and load the index.html of the app.
    mainWindow.loadFile(indexFilepath);

    // Open the DevTools.
    mainWindow.webContents.openDevTools()


    var menu = Menu.buildFromTemplate([
      {

        label: 'Menu',
        submenu: [
          {
            label: 'openDevTools',
            click() {
              mainWindow.webContents.openDevTools()
            }
          },
          {
            label: 'Open Tavern Music External',
            click() {
              shell.openExternal('https://www.youtube.com/embed/VZYr1eyC81g?autoplay=1')
            }
          },

          { type: 'separator' }, //basically empty menu point
          {
            label: 'Exit',
            click() {
              app.quit()
            },
            toolTip: 'it closes the app you dummy'
          }
        ]
      },
      { label: 'Menu2' }

    ]);

    Menu.setApplicationMenu(menu);

    return mainWindow;
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    mainWin = createWindow();
    mainWin.once("ready-to-show", () => {
      mainWin.show();
    });
    

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Require each JS file in the main-process dir
function loadScripts() {
  const files = glob.sync(path.join(__dirname, 'src/*.js'))
  files.forEach((file) => { require(file) })
}

initialize();
