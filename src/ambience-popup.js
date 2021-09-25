const { ipcMain, BrowserWindow } = require('electron')

const ambienceWindows = new Map(/*key=pauseButtonId, value=BrowserWindow*/);

//hacky stuff, very bad
let mainWinWebContents = null;

ipcMain.on('ambience-request', (event, musicId, buttonId) => {

        const win = createWindow();
        
        win.webContents.once('dom-ready', () => {
            //configures popup window
            win.webContents.send('play-ambience', musicId, buttonId);
        });

        //registers the corresponding Button and window in the map
        ambienceWindows.set(buttonId, win);

    //again, i feel bad for this code
    mainWinWebContents = event.sender;

});


ipcMain.on('ambience-duplicate-check', (event, musicId) => {
    console.log("duplicate = " + ambienceWindows.has(`${musicId}PauseBtn`));
    event.returnValue = !ambienceWindows.has(`${musicId}PauseBtn`);
});

//closes the window corresponding eith the btnId
ipcMain.on('ambience-quit', (event, buttonId) => {
    if (buttonId === 'closeAll') {
        event.sender.send('ambience-delete-btn', 'closeAll');
        ambienceWindows.forEach((value, key) => { value.close() });
        //clears the map
        ambienceWindows.clear();

    } else {
        ambienceWindows.get(buttonId).close();
        ambienceWindows.delete(buttonId);

        //event.sender.send('ambience-delete-btn', buttonId);
        //TODO: this is hacky and does not work with multiple mainWindows
        mainWinWebContents.send('ambience-delete-btn', buttonId);
        console.log(buttonId);

    }

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