import { createReadStream } from "fs";
import $ from "logsen";
import { basename } from "path";
import * as request from "request";
import { TimeStamp } from "./recordingManager";

/**
 * Options for initializing an ApiHandler-instance..
 */
export interface ApiManagerOptions {
    /**
     * Which server to connect to.
     */
    hostname: string;

    /**
     * Which port to connect to.
     */
    port: string;

    /**
     * Whether to use secure or insecure connection.
     */
    secure: boolean;
}

/**
 * Credentials for connecting with the API.
 */
export interface ApiManagerCredentials {
    username: string;
    password: string;
}

/**
 * Class for managing the communcation with the API.
 */
export class ApiManager {
    // API version is used in request paths.
    private static apiVersion = "v1";

    // Client ID and Secret hardcoded for this App.
    // Used in generateToken() request.
    private static clientID = "PPDPDvXf7bkd5bDLVhttUIxn";
    private static clientSecret = "qvU7ckxCxYZBNfIItVRtPp5mML9UxnTu4M31migU9FYXTj13";

    /**
     * Creates a new API manager that interfaces with the
     * remote CoVoD backend under the default configuration.
     */
    public static createRemote(): ApiManager {
        return new ApiManager({ hostname: "covod.bre4k3r.de", port: "443", secure: true });
    }

    /**
     * Creates a new API manager that interfaces with a
     * local CoVoD backend under the default configuration.
     */
    public static createLocal(): ApiManager {
        return new ApiManager({ hostname: "localhost", port: "5000", secure: false });
    }

    // API Server address.
    public hostname = "covod.bre4k3r.de";

    // API Port.
    public port: string;

    // API Protocol. SSL supported.
    public protocol: string;

    // API Token is automatically set on login by generateToken()
    // tslint:disable-next-line:no-var-keyword
    private apiToken!: string;

    private connected = false;
    private loginCredentials!: ApiManagerCredentials;

    /**
     * Create a new instance of the ApiManager.
     */
    public constructor({ hostname, port, secure }: ApiManagerOptions) {
        this.hostname = hostname;
        this.port = port;
        this.protocol = secure ? "https" : "http";
    }

    /**
     * Login into the API with the given credentials.
     */
    public async login({ username, password }: ApiManagerCredentials): Promise<boolean> {
        if (!username || !password) {
            return false;
        }
        this.loginCredentials = {
            username,
            password
        };
        return this.connect();
    }

    /**
     * Connect to the API with the currently stored credentials;
     */
    private async connect(): Promise<boolean> {
        try {
            const token: string = await this.generateToken(this.loginCredentials);
            this.apiToken = token;
            this.connected = true;
            return true;
        } catch (e) {
            this.connected = false;
            return false;
        }
    }

    /**
     * Generate a new token for the API.
     */
    private async generateToken({ username, password }: ApiManagerCredentials): Promise<string> {
        return new Promise((resolve, reject) => {
            // oauth2 auth request.
            const options = {
                method: "POST",
                url: `${this.protocol}://${this.hostname}:${this.port}/oauth2/token`,
                formData: {
                    grant_type: "password",
                    client_id: ApiManager.clientID,
                    username,
                    password,
                    client_secret: ApiManager.clientSecret,
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
                    resolve(JSON.parse(body).access_token);
                }
                // on unsuccessful auth resolve with false.
                reject();
            });
        });
    }

    /**
     * Upload a new video to the API.
     */
    public async uploadMedia(lectureID: number, mediaPath: string): Promise<void> {
        if (!this.connected) {
            throw new Error("Not connected to API");
        }
        if (!(await this.checkToken(this.apiToken))) {
            if (!(await this.connect())) {
                throw new Error("Unable to connect to API!");
            }
        }

        return new Promise((resolve, reject) => {
            const options = {
                method: "POST",
                url: `${this.protocol}://${this.hostname}:${this.port}/api/${ApiManager.apiVersion}/lecture/${lectureID}/media`,
                headers: {
                    Authorization: `bearer ${this.apiToken}`
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
     * Upload a pdf for an existing lecture.
     */
    public async uploadPDF(lectureID: number, pdfPath: string): Promise<void> {
        if (!this.connected) {
            throw new Error("Not connected to API");
        }
        if (!(await this.checkToken(this.apiToken))) {
            if (!(await this.connect())) {
                throw new Error("Unable to connect to API!");
            }
        }

        return new Promise((resolve, reject) => {
            const options = {
                method: "POST",
                url: `${this.protocol}://${this.hostname}:${this.port}/api/${ApiManager.apiVersion}/lecture/${lectureID}/pdf`,
                headers: {
                    Authorization: `bearer ${this.apiToken}`
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
     * Upload the timestamp for an existing lecture.
     */
    public async uploadTimestamps(LectureID: number, timestamps: TimeStamp[]): Promise<void> {
        if (!this.connected) {
            throw new Error("Not connected to API");
        }
        if (!(await this.checkToken(this.apiToken))) {
            if (!(await this.connect())) {
                throw new Error("Unable to connect to API!");
            }
        }

        return new Promise((resolve, reject) => {
            const options = {
                method: "POST",
                url: `${this.protocol}://${this.hostname}:${this.port}/api/${ApiManager.apiVersion}/lecture/${LectureID}/timestamps`,
                headers: {
                    Authorization: `bearer ${this.apiToken}`
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
     * Add a new lecture.
     */
    public async addLecture(courseID: number, lectureNumber: number, name: string): Promise<number> {
        if (!this.connected) {
            throw new Error("Not connected to API");
        }
        if (!(await this.checkToken(this.apiToken))) {
            if (!(await this.connect())) {
                throw new Error("Unable to connect to API!");
            }
        }

        return new Promise((resolve, reject) => {
            const options = {
                method: "PUT",
                json: true,
                url: `${this.protocol}://${this.hostname}:${this.port}/api/${ApiManager.apiVersion}/lecture/0`,
                headers: {
                    Authorization: `bearer ${this.apiToken}`,
                    contentType: "application/json"
                },
                body: { course_id: courseID, number: lectureNumber, name }
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

    /**
     * Check, if the given token is still valid.
     */
    public async checkToken(tokenToCheck: string): Promise<boolean> {
        // oauth2 check token request.
        return new Promise((resolve, reject) => {
            const options = {
                method: "POST",
                url: `${this.protocol}://${this.hostname}:${this.port}/oauth2/check_token`,
                headers: {
                    Authorization: `bearer ${tokenToCheck}`
                }
            };

            // place post request.
            request.post(options, (err, res, body) => {
                if (err) {
                    $.log(err);
                    reject(err);
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
     * Get the API-Token.
     */
    public getApiToken(): string {
        return this.apiToken;
    }

    /**
     * Get the current version of the API.
     */
    public getApiVersion(): string {
        return ApiManager.apiVersion;
    }
}
