import { ipcMain, IpcMainEvent } from "electron";
import pdfManager from "./pdfManager";

/**
 * Class for managing the login process.
 */
class LoginManager {
    constructor() {
        ipcMain.on("login:submit", this.onLoginSubmit.bind(this));
    }

    public init(): LoginManager {
        return this;
    }

    /**
     * Handle the login-event.
     */
    private async onLoginSubmit(evt: IpcMainEvent, _arg: any): Promise<void> {
        // TODO: Implement OAuth und so
        // if (arg) {
        // pdfManager.loadPDF();
        pdfManager.selectPDF();
        evt.sender.send("login:response", {
            success: true
        });
        // }
    }
}

export default new LoginManager();
