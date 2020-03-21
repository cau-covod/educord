import { app, BrowserWindow, Menu } from "electron";
import $ from "logsen";
import path from "path";
import { rootDir } from "./../index";

/**
 * Class for managing our windows.
 */
class WindowManager {
    /**
     * Main-Window of the application.
     */
    private mainWindow!: BrowserWindow;

    /**
     * Start the window-manager.
     */
    public start(): void {
        // Initialize window, when application is ready
        app.whenReady().then(() => {
            this.mainWindow = this.createWindow();
            this.initializeMenu();
            $.log(this.mainWindow);
        });

        // If on mac, dont close applicaiton, when all windows are closed
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        // When clicking on icon and all windows are closed, create a new main window
        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.mainWindow = this.createWindow();
                this.initializeMenu();
            }
        });
    }

    /**
     * Create a new window.
     */
    private createWindow(): BrowserWindow {
        const win: BrowserWindow = new BrowserWindow({
            resizable: false,
            width: 1000,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        });
        win.loadFile(path.join(rootDir, "./../public/index.html"));
        return win;
    }

    /**
     * Create a menu for a window.
     *
     * @param window window to create the menu for
     */
    private initializeMenu(): void {
        // Store menu-template in any-array, so we can add an empty object for MacOS
        const mainMenuTemplate: any[] = [
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
        // Add developer tools if not in production
        if (process.env.NODE_ENV !== "production") {
            mainMenuTemplate.push({
                label: "Dev Tools",
                submenu: [
                    {
                        label: "Toggle",
                        accelerator: "CmdOrCtrl+I",
                        click: () => {
                            this.mainWindow.webContents.toggleDevTools();
                        }
                    },
                    {
                        role: "reload"
                    }
                ]
            });
        }
        // If on MacOS, insert one element at the start of an array
        if (process.platform === "darwin") {
            mainMenuTemplate.unshift();
        }

        Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
    }
}

/**
 * Export the WindowManager as a singleton.
 * To start the the application, run WindowManager.start().
 */
export default new WindowManager();
