import { ipcMain, IpcMainEvent } from "electron";
import { writeFileSync } from "fs";
import { join, sep } from "path";

export interface TimeStamp {
    time: number;
    page?: number;
    chapter?: number;
    description?: string;
}

/**
 * Class for managing the recording of timestamps etc.
 */
export class RecordingManager {
    private timer = 0;
    private recording = false;

    private timeStamps: TimeStamp[] = [];

    private lastTimeStamp = "";
    private pastTimeStamps: any = {};

    constructor() {
        ipcMain.on("recording:start", this.onRecordStart.bind(this));
        ipcMain.on("recording:stop", this.onRecordStop.bind(this));
        ipcMain.on("pdf:page:update", this.onPdfPageUpdate.bind(this));
        ipcMain.on("recording:saved", this.onSavedRecording.bind(this));
    }

    /**
     * Call this, to make funny things.
     */
    public init(): RecordingManager {
        return this;
    }

    /**
     * Handle the start of recording.
     */
    public onRecordStart(_evt: IpcMainEvent, _args: any): void {
        this.timer = 0;
        this.recording = true;
        this.increaseTimer();
    }

    /**
     * Handle the stop of recording.
     */
    public onRecordStop(_evt: IpcMainEvent, args: any): void {
        this.recording = false;
        const { timeStamp } = args;
        this.lastTimeStamp = timeStamp;
        this.pastTimeStamps[this.lastTimeStamp] = this.timeStamps;
        this.timeStamps = [];
    }

    /**
     * Handle the update of the PDF-Page.
     */
    public onPdfPageUpdate(_evt: IpcMainEvent, args: any): void {
        if (!this.recording) {
            return;
        }
        this.timeStamps.push({
            time: this.timer,
            page: args.page
        });
    }

    /**
     * Handle the saving of the recording.
     * Save the timestamps.
     */
    public onSavedRecording(_evt: IpcMainEvent, args: any): void {
        const { fileName } = args;
        const pathParts: string[] = fileName.split(sep);
        pathParts.pop();

        const lastTimeStamps = this.pastTimeStamps[this.lastTimeStamp];
        writeFileSync(
            join(pathParts.join(sep), `time-${this.lastTimeStamp}.json`),
            JSON.stringify(lastTimeStamps, null, 3),
            {
                encoding: "utf-8"
            }
        );
    }

    /**
     * Increase the timer.
     */
    private increaseTimer(): void {
        this.timer++;
        if (!this.recording) {
            return;
        }
        setTimeout(this.increaseTimer.bind(this), 1000);
    }
}
