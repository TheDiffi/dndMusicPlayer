import { BrowserWindow, ipcMain, mainWin } from "../main";
import { Song } from "..";
export{}

const assSongPopupFilepath = '../section/addSongPopup.html'

ipcMain.on('add-song-popup', (event: any) => {
    const win = createAddSongWindow();
})

ipcMain.on('add-song', (event: any, song: Song) => {
    mainWin.webContents.send('add-song-button', song);
})

function createAddSongWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 270,
        height: 350,
        resizable: true,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // Open the DevTools.
    win.webContents.openDevTools()

    // and load the index.html of the app.
    win.loadFile(assSongPopupFilepath);

    return win;
}