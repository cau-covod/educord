// import { ipcMain } from "electron";
import $ from "logsen";
import { join } from "path";
import { rootDir } from "./../index";

// tslint:disable-next-line:no-var-requires
const PdfWindow = require("electron-pdf-window");

/**
 * Class for managing the PDF-View.
 */
class PDFManager {
    /**
     * Load a PDF.
     */
    public loadPDF(): void {
        const window = new PdfWindow({
            width: 600,
            height: 800,
            webPreferences: {
                nodeIntegration: true
            },
            frame: false
        });
        const file = join("file://", rootDir, "../test.pdf");
        $.log(file);
        window.loadURL(file);
    }
}

export default new PDFManager();
