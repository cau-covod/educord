const { remote, ipcRenderer } = require("electron");
const { dialog } = remote;
const { sep } = require("path");

// Get important elements and attach proper events
const fileChooseBtn = document.getElementById("file-choose-btn");
fileChooseBtn.addEventListener("click", handleFileChooseClick);
const uploadBtn = document.getElementById("upload-btn");
uploadBtn.addEventListener("click", handleUploadClick);
const lectureNumberField = document.getElementById("lectureNumberInput");
const lectureNameField = document.getElementById("lectureNameInput");
const fileNameField = document.getElementById("filename-field");
const filePathField = document.getElementById("filepath-hidden");

/**
 * Handle the click on the "select-file"-button.
 */
async function handleFileChooseClick(evt) {
    evt.preventDefault();
    const mp4 = await dialog.showOpenDialog({
        title: "Select video to upload",
        buttonLabel: "Select",
        properties: ["openFile"]
    });
    if (mp4.canceled || !mp4.filePaths[0].endsWith(".mp4")) {
        return;
    }
    selectMp4(mp4.filePaths[0]);
}

/**
 * Select a MP4 to upload and add its filename to the input field.
 */
async function selectMp4(mp4) {
    if (!mp4) {
        return;
    }
    filePathField.value = mp4;
    const pathArray = mp4.split(sep);
    const fileName = pathArray.pop();
    fileNameField.value = fileName;
}

/**
 * Handle click on "upload" button and send event to main process.
 */
async function handleUploadClick(evt) {
    evt.preventDefault();
    if (!filePathField.value || !lectureNameField.value || !lectureNumberField.value) {
        return;
    }
    ipcRenderer.send("video:upload:submit", {
        filePath: filePathField.value,
        lectureNumber: parseInt(lectureNumberField.value, 10),
        lectureName: lectureNameField.value
    });
}
