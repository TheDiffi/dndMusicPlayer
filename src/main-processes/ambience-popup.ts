import {mainWin } from "../main";
export{}
const {BrowserWindow, ipcMain } = require('electron')


const ambienceWindows = new Map(/*key=pauseButtonId, value=BrowserWindow*/);
const ambiencePopupFilepath = '../section/ambiencePopup.html'

ipcMain.on('ambience-request', (event: Event, musicId: any, buttonId: any) => {

        const win = createAmbienceWindow();
        
        win.webContents.once('dom-ready', () => {
            //configures popup window
            win.webContents.send('play-ambience', musicId, buttonId);
        });

        //registers the corresponding Button and window in the map
        ambienceWindows.set(buttonId, win);
        console.log('Opened ambience Window: ')
        console.log(ambienceWindows)

});


ipcMain.on('ambience-duplicate-check', (event: Event, musicId: any) => {
    console.log("duplicate = " + ambienceWindows.has(`${musicId}PauseBtn`));
    event.returnValue = !ambienceWindows.has(`${musicId}PauseBtn`);
});



//closes the window corresponding eith the btnId
ipcMain.on('ambience-quit', (event: any, buttonId: string) => {
    if (buttonId === 'closeAll') {
        event.sender.send('ambience-delete-btn', 'closeAll');
        ambienceWindows.forEach((value, key) => { value.close() });
        //clears the map
        ambienceWindows.clear();

    } else {
        console.log('Found to close: ');
        console.log(ambienceWindows.get(buttonId));
        ambienceWindows.get(buttonId)?.close();
        ambienceWindows.delete(buttonId);

        //event.sender.send('ambience-delete-btn', buttonId);
        mainWin.webContents.send('ambience-delete-btn', buttonId);
        

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
        alwaysOnTop: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })


    // and load the index.html of the app.
    win.loadFile(ambiencePopupFilepath);

    // Open the DevTools.
    win.webContents.openDevTools()

    return win;
}