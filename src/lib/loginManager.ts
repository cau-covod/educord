import { ipcMain, IpcMainEvent } from "electron";
import $ from "logsen";
import * as url from "url";
import { ApiManager } from "./apiManager";
import { PDFManager } from "./pdfManager";
import { WindowManager } from "./windowManager";

/**
 * Class for managing the login process.
 */
export class LoginManager {
    private windowManager: WindowManager;
    private pdfManager: PDFManager;
    private apiManager: ApiManager;

    constructor(windowManager: WindowManager, pdfManager: PDFManager, apiManager: ApiManager) {
        this.windowManager = windowManager;
        this.pdfManager = pdfManager;
        this.apiManager = apiManager;

        // Bind login events.
        ipcMain.on("login:init", this.handleLoginInit.bind(this));
        ipcMain.on("login:submit", this.handleLoginSubmit.bind(this));
    }

    /**
     * Handle initialization of form by sending
     * a default server URL to the renderer.
     */
    private async handleLoginInit(evt: IpcMainEvent): Promise<void> {
        evt.reply("login:setServerURL", {
            value: `${this.apiManager.protocol}://${this.apiManager.hostname}:${this.apiManager.port}`
        });
    }

    /**
     * Handle login event.
     */
    private async handleLoginSubmit(evt: IpcMainEvent, credentials: any): Promise<void> {
        try {
            const serverURL = url.parse(credentials.serverURL);
            if (serverURL.protocol) { this.apiManager.protocol = serverURL.protocol.replace(":", ""); }
            if (serverURL.port) { this.apiManager.port = serverURL.port; }
            if (serverURL.hostname) { this.apiManager.hostname = serverURL.hostname; }

            const res = await this.apiManager.login({ username: credentials.username, password: credentials.password });
            if (res) {
                // pdfManager.loadPDF();
                this.pdfManager.selectPDF();
                evt.reply("login:response", {
                    success: true
                });
                this.windowManager.setRealMainMenu();
            } else {
                // tell if pw or user was false.
                evt.reply("login:response", {
                    success: false
                });
            }
        } catch (e) {
            // TODO: Find a better way to signal to the user that the
            //       server URL could not be parsed.
            $.err(e);
            evt.reply("login:response", {
                success: false
            })
        }
    }
}
