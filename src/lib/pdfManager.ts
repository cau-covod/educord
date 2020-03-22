import { dialog, OpenDialogReturnValue } from "electron";
import { join } from "path";

// tslint:disable-next-line:no-var-requires
const PdfWindow = require("electron-pdf-window");

/**
 * Class for managing the PDF-View.
 */
class PDFManager {
    private pdfWindow: any;

    /**
     * Select a PDF from the Filesystem.
     */
    public async selectPDF(): Promise<void> {
        const pdf = await dialog.showOpenDialog({ title: "Select PDF", buttonLabel: "Open", properties: ["openFile"] });
        if (pdf.canceled || !pdf.filePaths[0].endsWith(".pdf")) {
            return;
        }
        this.loadPDF(pdf);
    }

    /**
     * Load a PDF.
     */
    public loadPDF(pdf: OpenDialogReturnValue): void {
        if (!this.pdfWindow) {
            this.pdfWindow = new PdfWindow({
                width: 600,
                height: 800,
                webPreferences: {
                    nodeIntegration: true
                },
                frame: false
            });
        }
        const file = join("file://", pdf.filePaths[0]);
        this.pdfWindow.loadURL(file);
    }
}

export default new PDFManager();
