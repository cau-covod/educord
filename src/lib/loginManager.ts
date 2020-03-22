import { ipcMain, IpcMainEvent } from "electron";
import { generateToken } from "./APIHandler";
import pdfManager from "./pdfManager";

/**
 * Class for managing the login process.
 */
class LoginManager {
    constructor() {
        // Bind login event.
        ipcMain.on("login:submit", this.handleLoginSubmit.bind(this));
    }

    public init(): LoginManager {
        return this;
    }

    /**
     * Handle login event.
     */
    private async handleLoginSubmit(evt: IpcMainEvent, credentials: any): Promise<void> {
        const res = await generateToken(credentials.username, credentials.password);
        if (res) {
            // pdfManager.loadPDF();
            pdfManager.selectPDF();
            evt.sender.send("login:response", {
                success: true
            });
        } else {
            // tell if pw or user was false.
            evt.sender.send("login:response", {
                success: false
            });
        }
    }
}

export default new LoginManager();
