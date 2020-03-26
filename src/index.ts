import { WindowManager } from "./lib/windowManager";

// Set ENV to production
process.env.NODE_ENV = "production";

/**
 * Initial function of our application.
 */
(() => {
    new WindowManager().start();
})();

/**
 * Export root-directory, so other files can reference properly.
 */
const rootDir = __dirname;
export { rootDir };
