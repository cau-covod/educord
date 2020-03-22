import { createReadStream } from "fs";
import $ from "logsen";
import { basename } from "path";
import * as request from "request";

// TODO fill out
export const API_VERSION = "v1";
// export const SERVER = "covod.bre4k3r.de"; // put server domain here.
export const SERVER = "localhost";
export const PORT = "5000"; // https port.

/**
 * Login and generate a token.
 *
 * @param username
 * @param password
 * @param client_id
 * @param client_secret
 */
// tslint:disable-next-line:variable-name
export function generateToken(username: string, password: string, client_id: string, client_secret: string): any {
    const options = {
        method: "POST",
        url: `http://${SERVER}:${PORT}/oauth2/token`,
        formData: {
            grant_type: "password",
            client_id,
            username,
            password,
            client_secret,
            scope: "upload view"
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
 * Upload media files.
 *
 * @param LectureID
 * @param mediaPath
 * @param API_Token
 */
// tslint:disable-next-line:variable-name
export function uploadMedia(LectureID: number, mediaPath: string, API_Token: string): void {
    const options = {
        method: "POST",
        url: `http://${SERVER}:${PORT}/api/${API_VERSION}/lecture/${LectureID}/media`,
        headers: {
            Authorization: `bearer ${API_Token}`
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
export function uploadPDF(LectureID: number, pdfPath: string, API_Token: string): void {
    const options = {
        method: "POST",
        url: `http://${SERVER}:${PORT}/api/${API_VERSION}/lecture/${LectureID}/pdf`,
        headers: {
            Authorization: `bearer ${API_Token}`
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
export function uploadTimestamps(LectureID: number, timestamps: string, API_Token: string): void {
    const options = {
        method: "POST",
        url: `http://${SERVER}:${PORT}/api/${API_VERSION}/lecture/${LectureID}/timestamps`,
        headers: {
            Authorization: `bearer ${API_Token}`
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
export async function checkToken(API_Token: string): Promise<boolean> {
    return new Promise(resolve => {
        const options = {
            method: "POST",
            url: `http://${SERVER}:${PORT}/oauth2/check_token`,
            headers: {
                Authorization: `bearer ${API_Token}`
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
 * @param courseid
 * @param number of lecture
 * @param name titel of lecture
 * @param API_Token
 */
// tslint:disable-next-line:variable-name
export function addLecture(courseid: number, number: number, name: string, API_Token: string): void {
    const options = {
        method: "PUT",
        url: `http://${SERVER}:${PORT}/api/${API_VERSION}/lecture`,
        headers: {
            Authorization: `bearer ${API_Token}`
        },
        body: JSON.stringify({ courseid, number, name })
    };

    request.post(options, (err, res, body) => {
        if (err) {
            return $.log(err);
        }
        $.log(`Status: ${res.statusCode}`);
        $.log(body);
    });
}
