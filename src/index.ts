import { app, BrowserWindow, Menu } from "electron";
import path from "path";

let mainWindow: BrowserWindow;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile(path.join(__dirname, "./../public/index.html"));

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate); // build the actual menu.
    Menu.setApplicationMenu(mainMenu); // insert menu.
}

(() => {
    app.whenReady().then(createWindow);
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
})();

// Menubar
const mainMenuTemplate: any[] = [
    // array needs to be any so we can add empty object later.
    {
        label: app.getName(),
        submenu: [
            {
                label: "Quit",
                accelerator: "CmdOrCtrl + Q",
                click(): void {
                    app.quit();
                }
            }
        ]
    }
];

// add developer tools if not in production.
if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "Dev Tools",
        submenu: [
            {
                label: "Toggle",
                accelerator: "CmdOrCtrl+I",
                click(): void {
                    mainWindow.webContents.openDevTools();
                }
            }
        ]
    });
}
