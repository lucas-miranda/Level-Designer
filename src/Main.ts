import { BrowserWindow, dialog, ipcMain } from 'electron';

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;

    static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    static onClose() {
        Main.mainWindow = null;
    }

    static onReady() {
        Main.mainWindow = new BrowserWindow({ width: 800, height: 600, fullscreen: true })
        Main.mainWindow.loadURL('file://' + __dirname + '/index.html');
        Main.mainWindow.setMenuBarVisibility(false);
        //Main.mainWindow.setAutoHideMenuBar(true);
        Main.mainWindow.setMinimumSize(800, 600);

        Main.mainWindow.on('closed', Main.onClose);
        Main.mainWindow.webContents.on('crashed', Main.onCrash);
        Main.mainWindow.on('unresponsive', Main.onUnresponsive);
    }

    static onActivate() {
        if (Main.mainWindow === null) {
            Main.onReady();
        }
    }

    static onCrash() {
        dialog.showMessageBox({
            type: 'info',
            title: 'Renderer Process Crashed',
            message: 'This process has crashed.',
            buttons: ['Reload', 'Close']
        },
        function (index) {
            if (index === 0) {
                Main.mainWindow.reload();
                return;
            }

            Main.mainWindow.close();
        });
    }

    static onUnresponsive() {
        dialog.showMessageBox({
            type: 'info',
            title: 'Renderer Process Hanging',
            message: 'This process has hanging.',
            buttons: ['Reload', 'Close']
        },
        function (index) {
            if (index === 0) {
                Main.mainWindow.reload();
                return;
            }

            Main.mainWindow.close();
        });
    }

    static main(app: Electron.App) {
        Main.application = app;
        Main.application.on('ready', Main.onReady);
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('activate', Main.onActivate);

        // messages
        ipcMain.on('request-setup', (event) => {
            event.sender.send('setup', 120, 90, /*50, 50,*/ { width: 16, height: 16 });
        })
    }
}
