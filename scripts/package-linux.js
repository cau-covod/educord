const packager = require("electron-packager");

const options = {
    appBundleId: "EDUCord",
    arch: ["x64", "ia32"],
    dir: ".",
    executableName: "EDUCord",
    out: "./package",
    platform: ["linux"],
    overwrite: true
};

packager(options);
