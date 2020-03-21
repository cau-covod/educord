
import windowManager from "./lib/windowManager";

/**
 * Initial function of our application.
 */
(() => {
    windowManager.start();
})();

/**
 * Export root-directory, so other files can reference properly.
 */
const rootDir = __dirname;
export { rootDir };
