import { IpcS, IpcR, Song } from "../../util/types.util";
import { BrowserWindow, ipcMain, mainWin } from "../../main";

const assSongPopupFilepath = "../section/addSongPopup.html";

ipcMain.on(IpcS.addSongPopup, (event: any) => {
	const win = createAddSongWindow();
});

ipcMain.on(IpcS.addSong, (event: any, song: Song) => {
	mainWin.webContents.send(IpcR.addSongButton, song);
});

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
			contextIsolation: false,
		},
	});

	// Open the DevTools.
	win.webContents.openDevTools();

	// and load the index.html of the app.
	win.loadFile(assSongPopupFilepath);

	return win;
}
