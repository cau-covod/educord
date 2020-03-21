const { writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");
const { tmpdir } = require("os");

const { desktopCapturer, remote, ipcRenderer } = require("electron");
const { Menu, dialog } = remote;
// const ffmpeg = require("ffmpeg");

const { createWorker } = require("@ffmpeg/ffmpeg");

const videoElement = document.querySelector("video");
const recordBtn = document.getElementById("recordBtn");
const vidSelectBtn = document.getElementById("vidSelectBtn");

// Attach function to events
vidSelectBtn.onclick = getVideoSources;
recordBtn.onclick = handleRecordClick;

// Recorders for audio and video sources
let mediaRecorder;
let audioRecorder;

// Blob for saving recorded audio
let globalAudioBlob;

// Function for sleeping
async function sleep() {
    return new Promise(resolve => {
        setTimeout(resolve, 1);
    });
}

/**
 * Get all the video sources
 */
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"]
    });

    // Build the menu with video sources
    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(src => {
            return {
                label: src.name,
                click: () => selectSource(src)
            };
        })
    );
    videoOptionsMenu.popup();
}

/**
 * Select a source for recording and setup MediaRecorder.
 */
async function selectSource(src) {
    vidSelectBtn.innerText = src.name;

    // Constraints for the video-capturing
    const videoConstrains = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: src.id
            }
        }
    };

    const audioConstrains = {
        audio: true
    };

    try {
        // Create a stream from the window to record
        const videoStream = await navigator.mediaDevices.getUserMedia(videoConstrains);
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstrains);

        // Preview the source in a video element
        videoElement.srcObject = videoStream;
        videoElement.play();

        // Create Media Recorder
        const videoOptions = {
            mimeType: "video/webm; codecs=h264",
            bitsPerSecond: 2000000
        };
        mediaRecorder = new MediaRecorder(videoStream, videoOptions);
        audioRecorder = new MediaRecorder(audioStream);

        // Register Event Handlers
        mediaRecorder.ondataavailable = handleVideoDataAvailable;
        audioRecorder.ondataavailable = handleAudioDataAvailable;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Handle the click-event on the record-button.
 */
function handleRecordClick(e) {
    e.preventDefault();

    // If there is no source selected, don't do anything
    if (!mediaRecorder) {
        return;
    }

    // Change button-colors
    recordBtn.classList.toggle("btn-success");
    recordBtn.classList.toggle("btn-danger");

    // Change text in button and start or stop the recording
    if (mediaRecorder.state !== "recording") {
        globalAudioBlob = null;
        recordBtn.innerText = "Aufnahme stoppen";
        mediaRecorder.start();
        audioRecorder.start();
    } else {
        recordBtn.innerText = "Aufnahme starten";

        // Stop recordings
        mediaRecorder.stop();
        audioRecorder.stop();
    }
}

/**
 * Handle the receiment of data.
 */
async function handleVideoDataAvailable(e) {
    // Get Timestamp for temp-video-saving
    const timeStamp = Date.now();

    // Generate MP4-Blob
    const videoBlob = new Blob([e.data], {
        type: "video/mp4; codecs=h264"
    });
    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());

    // Get save-path from user
    const fPath = await dialog.showSaveDialog({
        buttonLabel: "Speichern",
        defaultPath: `vid-${timeStamp}.mp4`
    });

    // If cancelled, return
    if (fPath.canceled) {
        return;
    }

    // Wait for audio-recorder to finish
    while (!globalAudioBlob) {
        await sleep();
    }

    // Build the audiobuffer
    const audioBlob = new Blob([globalAudioBlob], {
        type: "audio/wav; codecs=aac"
    });
    globalAudioBlob = null;
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());

    // Create folder in the temp directory of the OS
    const tmpDirName = join(tmpdir(), "educord_rec");
    try {
        mkdirSync(tmpDirName);
    } catch (e) {}
    let tmpVideoFile = join(tmpDirName, `vid-${timeStamp}.mp4`);
    let tmpAudioFile = join(tmpDirName, `audio-${timeStamp}.wav`);

    // Save audio to the given path
    writeFileSync(tmpAudioFile, audioBuffer);
    console.log("Audio saved successfully!");

    // Save the file to the given path
    writeFileSync(tmpVideoFile, videoBuffer);
    console.log("Video saved successfully!");

    // Send information about the locations of the files to main process
    ipcRenderer.send("video:locations", {
        tmpVideoFile,
        tmpAudioFile,
        fileName: fPath.filePath
    });
}

/**
 * Handle the finish of audio recording.
 */
function handleAudioDataAvailable(blob) {
    globalAudioBlob = blob.data;
}

/**
 * Handle the receiving of encoded video data.
 */
ipcRenderer.on("video:encoded:send", (event, args) => {
    writeFileSync(args.fileName, Buffer.from(args.data));
    console.log("File saved successfully!");
});
