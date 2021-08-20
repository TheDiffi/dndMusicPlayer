const { ipcMain, BrowserWindow } = require('electron')

const ambienceWindows = new Map(/*key=pauseButtonId, value=BrowserWindow*/);

//hacky stuff, very bad
let mainWinWebContents = null;

ipcMain.on('ambience-request', (event, id, buttonId) => {
    if (!ambienceWindows.has(buttonId)) {

        const win = createWindow();
        //registers the corresponding Button and window in the map
        ambienceWindows.set(buttonId, win);
        console.log('ambience-request');
        win.webContents.once('dom-ready', () => {
            //confihures popup window
            win.webContents.send('play-ambience', id);
            //appends pause btn on mainWindow
            event.sender.send('append-pauseBtn-ambience')
        });

    }


    mainWinWebContents = event.sender;

});

//closes the window corresponding eith the btnId
ipcMain.on('ambience-quit', (event, buttonId) => {
    if (buttonId === 'closeAll') {
        ambienceWindows.forEach((value, key) => { value.close() });
        event.sender.send('ambience-delete-btn', 'closeAll');

    } else {
        ambienceWindows.get(buttonId).close();
        event.sender.send('ambience-delete-btn', buttonId);

    }
});

ipcMain.on('ambience-quit2', (event) => {
    ambienceWindows.forEach((value, key) => {
        if (value.webContents.id === event.sender.id) {
            //TODO: this is hacky and does not work with multiple mainWindows
            mainWinWebContents.send('ambience-delete-btn', key);
            console.log(key);
        }
    });
});




function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 400,
        height: 260,
        resizable: false,
        autoHideMenuBar: true,
        transparent: true,
        alwaysOnTop: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })


    // and load the index.html of the app.
    win.loadFile('./section/ambience.html');
    return win;
}