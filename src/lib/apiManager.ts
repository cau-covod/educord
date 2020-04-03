import { createReadStream } from "fs";
import $ from "logsen";
import { basename } from "path";
import request from "request";
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
 * The response of a request.
 */
interface RequestResult {
    response: request.Response;
    body: any;
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
        const result = await this.performRequest("POST", "/oauth2/token", {
            formData: {
                grant_type: "password",
                client_id: ApiManager.clientID,
                username,
                password,
                client_secret: ApiManager.clientSecret,
                scope: "upload view"
            },
            json: true
        });
        const status = result.response.statusCode;
        if (status === 200) {
            return result.body;
        } else {
            throw new Error(`Could not generate token, got status ${status}`);
        }
    }

    /**
     * Upload a new video to the API.
     */
    public async uploadMedia(lectureID: number, mediaPath: string): Promise<void> {
        return this.performApiRequest("POST", `/lecture/${lectureID}/media`, {
            formData: {
                file: {
                    value: createReadStream(mediaPath),
                    options: {
                        filename: basename(mediaPath),
                        contentType: null
                    }
                }
            }
        });
    }

    /**
     * Upload a pdf for an existing lecture.
     */
    public async uploadPDF(lectureID: number, pdfPath: string): Promise<void> {
        return this.performApiRequest("POST", `/lecture/${lectureID}/pdf`, {
            formData: {
                file: {
                    value: createReadStream(pdfPath),
                    options: {
                        filename: basename(pdfPath),
                        contentType: null
                    }
                }
            }
        });
    }

    /**
     * Upload the timestamp for an existing lecture.
     */
    public async uploadTimestamps(lectureID: number, timestamps: TimeStamp[]): Promise<void> {
        return this.performApiRequest("POST", `/lecture/${lectureID}/timestamps`, {
            json: timestamps
        });
    }

    /**
     * Add a new lecture.
     */
    public async addLecture(courseID: number, lectureNumber: number, name: string): Promise<number> {
        const body = await this.performApiRequest("PUT", "/lecture/0", {
            json: { course_id: courseID, number: lectureNumber, name }
        });
        return body.id;
    }

    /**
     * Performs an API request. Non-200-requests translate into an error.
     */
    private async performApiRequest(method = "POST", endpoint: string, otherOptions: any): Promise<any> {
        if (!this.connected) {
            throw new Error("Not connected to API");
        }
        if (!(await this.checkToken(this.apiToken))) {
            if (!(await this.connect())) {
                throw new Error("Unable to connect to API!");
            }
        }

        const requestOptions = {
            headers: {
                Authorization: `bearer ${this.apiToken}`
            }
        };
        Object.assign(requestOptions, otherOptions);

        const result = await this.performRequest(method, `/api/${ApiManager.apiVersion}${endpoint}`, requestOptions);
        const status = result.response.statusCode;

        $.log(`${endpoint} -> Status ${status}`);

        if (status < 400) {
            return result.body;
        } else {
            throw new Error(`${endpoint} returned status ${status}`);
        }
    }

    /**
     * Check, if the given token is still valid.
     */
    public async checkToken(tokenToCheck: string): Promise<boolean> {
        // oauth2 check token request.
        const result = await this.performRequest("POST", "/oauth2/check_token", {
            headers: {
                Authorization: `bearer ${tokenToCheck}`
            }
        });
        return result.response.statusCode === 200;
    }

    /**
     * Performs an HTTP-request and returns a promise.
     *
     * @param method the HTTP method
     * @param path the endpoint on the server
     * @param otherOptions other options to pass to 'request'
     */
    private async performRequest(method: string, path: string, otherOptions: any): Promise<RequestResult> {
        return new Promise((resolve, reject) => {
            const options = {
                method,
                url: `${this.protocol}://${this.hostname}:${this.port}${path}`
            };
            Object.assign(options, otherOptions);

            request(options, (err, res, body) => {
                if (err) {
                    $.log(err);
                    reject(err);
                } else {
                    resolve({ response: res, body });
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
