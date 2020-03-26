import { ipcMain } from "electron";
// import fs from "fs";
import $ from "logsen";
import { sep, join } from "path";
import { rootDir } from "../index";
// tslint:disable-next-line:no-var-requires
const { createWorker } = require("@ffmpeg/ffmpeg");

/**
 * Initialize our "serverside" FFMPEG-Processing.
 */
export function initFFMPEG(): void {
    /**
     * Listen to information about the encoded files being send.
     */
    ipcMain.on("video:locations", async (event, data) => {
        const { tmpVideoFile, tmpAudioFile, fileName } = data;
        /**
         * Create a worker for processing the processing.
         */
        const worker = createWorker({
            corePath: join(rootDir, "node_modules/@ffmpeg/core/ffmpeg-core.js")
        });

        // Names for files
        const ffmpegVideo = tmpVideoFile.split(sep).pop();
        const ffmpegAudio = tmpAudioFile.split(sep).pop();
        const finalVideo = "final.mp4";

        /**
         * Marry video and sound.
         */
        try {
            await worker.load();
            await worker.write(ffmpegVideo, tmpVideoFile);
            await worker.write(ffmpegAudio, tmpAudioFile);
            await worker.run(
                `-i ${ffmpegVideo} -i ${ffmpegAudio} -c:v copy -c:a aac -strict experimental ${finalVideo}`,
                {
                    output: finalVideo
                }
            );
            await worker.remove(ffmpegVideo);
            await worker.remove(ffmpegAudio);
            const test = await worker.read(finalVideo);

            // Send encoded information back
            event.sender.send("video:encoded:send", {
                fileName,
                data: test.data
            });
        } catch (e) {
            $.err(e);
        }
    });
}
