import { createReadStream } from "fs";
import $ from "logsen";
import { basename } from "path";
import * as request from "request";
import { contentTracing } from "electron";

export const API_VERSION = "v1";

const SERVER = "covod.bre4k3r.de";
const PORT = "22022"; // ${PROTOCOL} port.

const PROTOCOL = "http";

// tslint:disable-next-line:no-var-keyword
var apiToken: string;

//  we should get another one for our app.
const CLIENT_ID = "PPDPDvXf7bkd5bDLVhttUIxn";
const CLIENT_SECRET = "qvU7ckxCxYZBNfIItVRtPp5mML9UxnTu4M31migU9FYXTj13";

/**
 * Login and generate a token.
 * Returns true if login was correct and also sets apiToken.
 * @param username
 * @param password
 */
export async function generateToken(username: string, password: string): Promise<boolean> {
    return new Promise(resolve => {
        const options = {
            method: "POST",
            url: `${PROTOCOL}://${SERVER}:${PORT}/oauth2/token`,
            formData: {
                grant_type: "password",
                client_id: CLIENT_ID,
                username,
                password,
                client_secret: CLIENT_SECRET,
                scope: "upload view"
            }
        };
        request.post(options, (err, res, body) => {
            if (err) {
                return $.log(err);
            }
            const code = res.statusCode;
            $.log("Token Status:" + code);
            if (code === 200) {
                apiToken = JSON.parse(body).access_token;
                $.log(apiToken);
                resolve(true);
            }
            resolve(false);
        });
    });
}

/**
 * Upload media files.
 *
 * @param LectureID
 * @param mediaPath
 * @param API_Token
 */
// tslint:disable-next-line:variable-name
export function uploadMedia(LectureID: number, mediaPath: string): void {
    const options = {
        method: "POST",
        url: `${PROTOCOL}://${SERVER}:${PORT}/api/${API_VERSION}/lecture/${LectureID}/media`,
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
            return $.log(err);
        }
        $.log(`Status: ${res.statusCode}`);
        $.log(body);
    });
}

/**
 * Upload PDF.
 *
 * @param LectureID
 * @param pdfPath
 * @param API_Token
 */
// tslint:disable-next-line:variable-name
export function uploadPDF(LectureID: number, pdfPath: string): void {
    const options = {
        method: "POST",
        url: `${PROTOCOL}://${SERVER}:${PORT}/api/${API_VERSION}/lecture/${LectureID}/pdf`,
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
            return $.log(err);
        }
        $.log(`Status: ${res.statusCode}`);
        $.log(body);
    });
}

/**
 * Upload timestam collection.
 * @param LectureID
 * @param timestamps
 * @param API_Token
 */
// tslint:disable-next-line:variable-name
export function uploadTimestamps(LectureID: number, timestamps: string): void {
    const options = {
        method: "POST",
        url: `${PROTOCOL}://${SERVER}:${PORT}/api/${API_VERSION}/lecture/${LectureID}/timestamps`,
        headers: {
            Authorization: `bearer ${apiToken}`
        },
        formData: {
            timestamps
        }
    };

    request.post(options, (err, res, body) => {
        if (err) {
            return $.log(err);
        }
        $.log(`Status: ${res.statusCode}`);
        $.log(body);
    });
}

/**
 * Validate token. Aks server if token is still valid.
 * @param API_Token
 * @return validity of token. Promise<boolean>
 */
// tslint:disable-next-line:variable-name
export async function checkToken(apiToken: string): Promise<boolean> {
    return new Promise(resolve => {
        const options = {
            method: "POST",
            url: `${PROTOCOL}://${SERVER}:${PORT}/oauth2/check_token`,
            headers: {
                Authorization: `bearer ${apiToken}`
            }
        };

        request.post(options, (err, res, body) => {
            if (err) {
                return $.log(err);
            }
            $.log(`Status: ${res.statusCode}`);
            $.log(body);
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

/**
 * Add lecture.
 *
 * @param courseid
 * @param number of lecture
 * @param name titel of lecture
 * @param API_Token
 *
 * @return lecureID
 */
// tslint:disable-next-line:variable-name
export async function addLecture(courseid: number, number: number, name: string): Promise<string> {
    return new Promise(resolve => {
        $.log(apiToken);
        const options = {
            method: "PUT",
            url: `${PROTOCOL}://${SERVER}:${PORT}/api/${API_VERSION}/lecture/0`,
            headers: {
                Authorization: `bearer 9oHi75e5ApadMSZ4jKBWv5U8XOT6Dnj9BwFkcN2djp`,
                contentType: "application/json"
            },
            body: JSON.stringify({ courseid, number, name })
        };

        request.put(options, (err, res, body) => {
            if (err) {
                return $.log(err);
            }
            $.log(`Status: ${res.statusCode}`);
            $.log(body);
            resolve("test");
        });
    });
}

// generateToken("test", "passwort");
// $.log(apiToken);
addLecture(1, 2, "Paul der Käfer geht spazieren.");
