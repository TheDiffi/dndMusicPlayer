// Modules to control application life and create native browser window
export { mainWin, BrowserWindow, ipcMain };
const path = require("path");
const glob = require("glob");
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const shell = require("electron").shell;

var mainWin: any;
const indexFilepath = "../section/index.html";

function initialize() {
  loadScripts();

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    mainWin = createMainWindow();
    mainWin.once("ready-to-show", () => {
      mainWin.show();
    });

    mainWin.on("close", () => {
      app.quit();
    });

    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
  });
}

function createMainWindow() {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 1280,
    height: 790,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(indexFilepath);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Require each JS file in the main-process dir
function loadScripts() {
  const files = glob.sync(path.join(__dirname, "./main-processes/*.js"));
  files.forEach((file: string) => {
    require(file);
  });
}





initialize();
