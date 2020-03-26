import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { rootDir } from "./../index";
import { ApiManager } from "./apiManager";
import { initFFMPEG } from "./ffmpegManager";
import { LoginManager } from "./loginManager";
import { PDFManager } from "./pdfManager";
import { RecordingManager } from "./recordingManager";
import { UploadManager } from "./uploadManager";

/**
 * Class for managing our windows.
 */
export class WindowManager {
    /**
     * Main-Window of the application.
     */
    private mainWindow!: BrowserWindow;

    private apiManager = ApiManager.createRemote();
    private pdfManager = new PDFManager();
    private recordingManager = new RecordingManager();
    private uploadManager = new UploadManager(this.apiManager);

    /**
     * Start the window-manager.
     */
    public start(): void {
        // Initialize window, when application is ready
        app.whenReady().then(() => {
            this.mainWindow = this.createWindow();

            // Login manager constructor has side effects that bind to IPC events
            // tslint:disable-next-line:no-unused-expression
            new LoginManager(this, this.pdfManager, this.apiManager);

            this.mainWindow.on("closed", () => {
                app.quit();
            });

            this.initializeMenu();
            initFFMPEG();
            this.recordingManager.init();
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
        win.loadFile(path.join(rootDir, "./../public/login/login.html"));
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
                label: app.name,
                submenu: [
                    {
                        label: "Quit",
                        accelerator: "CmdOrCtrl + Q",
                        click(): void {
                            app.quit();
                        }
                    },
                    { type: "separator" },
                    { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                    { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                    { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                    { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                    { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                    { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
                ]
            }
        ];
        // Add developer tools if not in production
        if (process.env.NODE_ENV !== "production") {
            mainMenuTemplate.push({
                label: "Dev Tools", // own menu item in bar.
                submenu: [
                    // the menus content.
                    {
                        label: "Toggle",
                        accelerator: "CmdOrCtrl+I",
                        click: () => {
                            this.mainWindow.webContents.toggleDevTools();
                        }
                    },
                    {
                        // reload role is basically "Reload" with CmdOrCtrl+R and reloads the window.
                        role: "reload"
                    }
                ]
            });
        }
        // If on MacOS, insert one element at the start of an array.
        if (process.platform === "darwin") {
            mainMenuTemplate.unshift({
                label: "The Unseen"
            });
        }
        Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
    }

    /**
     * Set menu after login.
     */
    public setRealMainMenu(): void {
        // Bind managers since 'this' changes inside the menu handlers
        const uploadManager = this.uploadManager;
        const pdfManager = this.pdfManager;

        // Store menu-template in any-array, so we can add an empty object for MacOS
        const mainMenuTemplate: any[] = [
            {
                label: app.name,
                submenu: [
                    {
                        label: "Quit",
                        accelerator: "CmdOrCtrl + Q",
                        click(): void {
                            app.quit();
                        }
                    }
                ]
            },
            { type: "separator" },
            {
                label: "Upload",
                submenu: [
                    {
                        label: "Upload recording",
                        click(): void {
                            uploadManager.openUploadWindow();
                        }
                    }
                ]
            },
            {
                label: "PDF",
                submenu: [
                    {
                        label: "Open",
                        accelerator: "CmdOrCtrl + O",
                        click(): void {
                            pdfManager.selectPDF();
                        }
                    },
                    { type: "separator" },
                    { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                    { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                    { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                    { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                    { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                    { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
                ]
            }
        ];
        // Add developer tools if not in production
        if (process.env.NODE_ENV !== "production") {
            mainMenuTemplate.push({
                label: "Dev Tools", // own menu item in bar.
                submenu: [
                    // the menus content.
                    {
                        label: "Toggle",
                        accelerator: "CmdOrCtrl+I",
                        click: () => {
                            this.mainWindow.webContents.toggleDevTools();
                        }
                    },
                    {
                        // reload role is basically "Reload" with CmdOrCtrl+R and reloads the window.
                        role: "reload"
                    }
                ]
            });
        }
        // If on MacOS, insert one element at the start of an array.
        if (process.platform === "darwin") {
            mainMenuTemplate.unshift({
                label: "The Unseen"
            });
        }
        Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
    }
}
