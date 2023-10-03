import { IpcChannelsSend, IpcChannelsReturn } from "src/util/enums";
import { BrowserWindow, ipcMain, mainWin } from "../../main";
import { Song } from "../../renderer";


const assSongPopupFilepath = '../section/addSongPopup.html'

ipcMain.on(IpcChannelsSend.addSongPopup, (event: any) => {
    const win = createAddSongWindow();
})

ipcMain.on(IpcChannelsSend.addSong, (event: any, song: Song) => {
    mainWin.webContents.send(IpcChannelsReturn.addSongButton, song);
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