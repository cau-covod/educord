import { createReadStream } from "fs";
import $ from "logsen";
import { basename } from "path";
import * as request from "request";
import { TimeStamp } from "./recordingManager";

// API version is used in request paths.
export const API_VERSION = "v1";

// API Server address.
const SERVER = "covod.bre4k3r.de";

// At the moment no PORT necesessary.
// If port should be used it needs to be set with :
// e.g. ":5000"
const PORT = "";

// API Protocol. SSL supported.
const PROTOCOL = "https";

// API Token is automatically set on login by generateToken()
// tslint:disable-next-line:no-var-keyword
export var apiToken: string;

// Client ID and Secret hardcoded for this App.
// Used in generateToken() request.
const CLIENT_ID = "PPDPDvXf7bkd5bDLVhttUIxn";
const CLIENT_SECRET = "qvU7ckxCxYZBNfIItVRtPp5mML9UxnTu4M31migU9FYXTj13";

/**
 * Login and generate a token.
 * Auto sets apiToken on successful login.
 *
 * @param username to log in with.
 * @param password for this user.
 *
 * @return Promise<boolean> true for successful login.
 */
export async function generateToken(username: string, password: string): Promise<boolean> {
    return new Promise(resolve => {
        // oauth2 auth request.
        const options = {
            method: "POST",
            url: `${PROTOCOL}://${SERVER}${PORT}/oauth2/token`,
            formData: {
                grant_type: "password",
                client_id: CLIENT_ID,
                username,
                password,
                client_secret: CLIENT_SECRET,
                scope: "upload view"
            }
        };

        // place post request.
        request.post(options, (err, res, body) => {
            if (err) {
                $.log(err);
            }
            const code = res.statusCode;
            $.log("Token Status:" + code);
            // on successful login set apiToken and resolve true.
            if (code === 200) {
                apiToken = JSON.parse(body).access_token;
                resolve(true);
            }
            // on unsuccessful auth resolve with false.
            resolve(false);
        });
    });
}

/**
 * Upload media files to server.
 * Accepted are video and soundfiles.
 *
 * @param LectureID gotten from addLecture()
 * @param mediaPath to video or sound file.
 */
// tslint:disable-next-line:variable-name
export async function uploadMedia(LectureID: number, mediaPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            url: `${PROTOCOL}://${SERVER}${PORT}/api/${API_VERSION}/lecture/${LectureID}/media`,
            headers: {
                Authorization: `bearer ${apiToken}`
            },
            formData: {
                file: {
                    value: createReadStream(mediaPath),
                    options: {
                        filename: basename(mediaPath),
                        contentType: null
                    }
                }
            }
        };

        request.post(options, (err, res, body) => {
            if (err) {
                $.log(err);
                reject();
            }
            $.log(`Status: ${res.statusCode}`);
            $.log(body);
            resolve();
        });
    });
}

/**
 * Upload PDF to Server.
 *
 * @param LectureID gotten by addListener() - should match with the media one.
 * @param pdfPath to PDF.
 */
// tslint:disable-next-line:variable-name
export async function uploadPDF(LectureID: number, pdfPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            url: `${PROTOCOL}://${SERVER}${PORT}/api/${API_VERSION}/lecture/${LectureID}/pdf`,
            headers: {
                Authorization: `bearer ${apiToken}`
            },
            formData: {
                file: {
                    value: createReadStream(pdfPath),
                    options: {
                        filename: basename(pdfPath),
                        contentType: null
                    }
                }
            }
        };

        request.post(options, (err, res, body) => {
            if (err) {
                $.log(err);
                reject();
            }
            $.log(`Status: ${res.statusCode}`);
            $.log(body);
            resolve();
        });
    });
}

/**
 * Upload timestam collection.
 *
 * Timestamps collections keep information
 * about when which pdf page is shown in the media.
 *
 * @param LectureID gotten from addLecture() matching with media / (pdf).
 * @param timestampsare an array of json objects with keys: time, page.
 */
// tslint:disable-next-line:variable-name
export async function uploadTimestamps(LectureID: number, timestamps: TimeStamp[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            url: `${PROTOCOL}://${SERVER}${PORT}/api/${API_VERSION}/lecture/${LectureID}/timestamps`,
            headers: {
                Authorization: `bearer ${apiToken}`
            },
            json: true,
            body: timestamps
        };

        request.post(options, (err, res, body) => {
            if (err) {
                $.log(err);
                reject();
            }
            $.log(`Status: ${res.statusCode}`);
            $.log(body);
            resolve();
        });
    });
}

/**
 * Validate a token.
 * Ask server if API Token is still valid.
 *
 * @param API_Token token to test.
 *
 * @return validity of token. Promise<boolean>
 *          true if token valid.
 *          false if token invalid.
 */
// tslint:disable-next-line:variable-name
export async function checkToken(API_Token: string): Promise<boolean> {
    // oauth2 check token request.
    return new Promise(resolve => {
        const options = {
            method: "POST",
            url: `${PROTOCOL}://${SERVER}${PORT}/oauth2/check_token`,
            headers: {
                Authorization: `bearer ${API_Token}`
            }
        };

        // place post request.
        request.post(options, (err, res, body) => {
            if (err) {
                $.log(err);
            }
            $.log(`Status: ${res.statusCode}`);
            $.log(body);
            if (res.statusCode === 200) {
                // if status code is 200 which means success rsolve true.
                resolve(true);
            } else {
                // else resolve false.
                // Non successful oauth request may expect status 401 Authentication Error.
                resolve(false);
            }
        });
    });
}

/**
 * Add lecture.
 *
 * @param courseid of professor.
 * @param number of lecture.
 * @param name titel of lecture.
 *
 * @return new lecureID.
 */
// tslint:disable-next-line:variable-name
export async function addLecture(course_id: number, number: number, name: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const options = {
            method: "PUT",
            json: true,
            url: `${PROTOCOL}://${SERVER}${PORT}/api/${API_VERSION}/lecture/0`,
            headers: {
                Authorization: `bearer ${apiToken}`,
                contentType: "application/json"
            },
            body: { course_id, number, name }
        };

        // place put request.
        request.put(options, (err, res, body) => {
            if (err) {
                $.log(err);
                reject();
            }
            $.log(`Status: ${res.statusCode}`);
            resolve(body.id);
        });
    });
}
