import { mainWin } from "../main";
export {};

const { BrowserWindow, ipcMain } = require("electron");
const ambienceWindows = new Map<string, string>(/*key=pauseButtonId, value=BrowserWindowId*/);
const ambiencePopupFilepath = "../section/ambiencePopup.html";




ipcMain.on("ambience-request", (event: any, ambienceId: string) => {

  const win = createAmbienceWindow();

  win.webContents.once("dom-ready", () => {
    //configures popup window
    win.webContents.send("play-ambience", ambienceId);

    //registers the corresponding Button and window in the map
    ambienceWindows.set(ambienceId, win.id);
    console.log("Opened ambience Window. ID: " + win.id);

    event.returnValue = true;
  });
});


//closes the window corresponding eith the btnId
ipcMain.on("ambience-close", (event: any, ambienceId: string) => {

    if (ambienceId === "closeAll") {
    ambienceWindows.forEach((value, key) => {
        BrowserWindow.fromId(value).destroy();
    });

    //clears the map
    ambienceWindows.clear();
    console.log("Closed all ambience Windows");

    //responds to caller
    event.sender.send("ambience-closed", "closeAll");

  } else {
    let win = BrowserWindow.fromId(ambienceWindows.get(ambienceId))
    console.log("Closed Ambience Window. ID: " + win.id);
    win.destroy();

    ambienceWindows.delete(ambienceId);

    //responds to the caller
    mainWin.webContents.send("ambience-closed", ambienceId);

  }
});



function createAmbienceWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 400,
    height: 260,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    alwaysOnTop: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  win.loadFile(ambiencePopupFilepath);

  // Open the DevTools.
  //win.webContents.openDevTools();

  return win;
}
