import { BrowserWindow } from 'electron';

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

    static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    static onClose() {
        Main.mainWindow = null;
    }

    static onReady() {
        Main.mainWindow = new Main.BrowserWindow({ width: 800, height: 600 })
        Main.mainWindow.loadURL('file://' + __dirname + '/index.html');

        Main.mainWindow.on('closed', Main.onClose);
    }

    static onActivate() {
        if (Main.mainWindow === null) {
            Main.onReady();
        }
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('ready', Main.onReady);
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('activate', Main.onActivate);
    }
}
