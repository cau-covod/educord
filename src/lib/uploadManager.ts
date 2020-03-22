import { BrowserWindow, ipcMain, IpcMainEvent, dialog } from "electron";
import { existsSync } from "fs";
import $ from "logsen";
import { join, sep } from "path";
import { rootDir } from "../index";
import { addLecture, uploadMedia, uploadTimestamps } from "./APIHandler";

/**
 * Class for managing the file-upload.
 */
class UploadManager {
    private window!: BrowserWindow | null;

    constructor() {
        // bind to video upload submit
        ipcMain.on("video:upload:submit", this.handleVideoUploadClick.bind(this));

        // bin to open-window-upload-event
        ipcMain.on("window:upload:open", this.openUploadWindow.bind(this));
    }

    /**
     * Handle the submit of the upload form.
     */
    private async handleVideoUploadClick(_evt: IpcMainEvent, arg: any): Promise<void> {
        if (this.window) {
            this.window.close();
        }

        // Get information from the argument
        const { filePath, lectureName, lectureNumber } = arg;
        const pathArgs: string[] = filePath.split(sep);
        const fileName = pathArgs.pop();
        // Check, if files exist
        if (!fileName || !existsSync(filePath)) {
            return;
        }

        // Try to get the timestamps for the video
        const folder = pathArgs.join(sep);
        const timestampFileName = join(folder, fileName.replace("vid-", "time-").replace("mp4", "json"));
        let timeStamps = null;
        try {
            timeStamps = require(timestampFileName);
        } catch (e) {
            $.err(e);
        }

        try {
            // Create a new lecture
            const lectureID = await addLecture(1, lectureNumber, lectureName);
            // Upload the video for the lecture
            await uploadMedia(lectureID, filePath);

            // If existing, upload the timestamps for the lecture
            if (timeStamps) {
                await uploadTimestamps(lectureID, timeStamps);
            }

            // Show message, if upload didnt throw an error
            dialog.showMessageBox((null as unknown) as BrowserWindow, {
                type: "info",
                buttons: ["Ok"],
                defaultId: 0,
                title: "Upload succeded",
                message: "Upload successful!",
                detail: "The upload of your recording was successful!"
            });
        } catch (e) {
            // Show error-message, if upload threw an error
            dialog.showMessageBox((null as unknown) as BrowserWindow, {
                type: "error",
                buttons: ["Ok"],
                defaultId: 0,
                title: "Upload failed",
                message: "Upload failed",
                detail: e
            });
            $.err(e);
        }
    }

    /**
     * Open the Upload window.
     */
    public openUploadWindow(): void {
        if (!this.window) {
            this.window = new BrowserWindow({
                width: 400,
                height: 300,
                resizable: false,
                webPreferences: {
                    nodeIntegration: true
                }
            });
            this.window.on("close", (..._args: any) => (this.window = null));
            const path = join(rootDir, "../public/uploader/uploader.html");
            this.window.loadFile(path);
        }
        this.window.show();
    }
}

export default new UploadManager();
