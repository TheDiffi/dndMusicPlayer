const { ipcMain, BrowserWindow } = require('electron')

//hässliche lösung, wieder das gleiche Problem
let mainWinWebContents;

ipcMain.on('add-song-popup', (event) => {
    const win = createWindow();
    mainWinWebContents = event.sender;
})

ipcMain.on('add-song', (event2, song) => {
    mainWinWebContents.send('add-song-button', song);
})

function createWindow() {
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


    // and load the index.html of the app.
    win.loadFile('./section/addSongPopup.html');

    return win;
}