#!/usr/bin/env node
const packager = require("electron-packager");

const allowed_platforms = ["darwin", "win32", "linux"];
if (!allowed_platforms.includes(process.platform)) {
    console.error("Your platform is currently not supported!");
    process.exit(-1);
}

if (process.arch !== "x64") {
    console.error("Your arch is currently not supported! Only x64 is supported!");
    process.exit(-1);
}

const options = {
    appBundleId: "EDUcord",
    arch: [process.arch],
    dir: ".",
    icon: __dirname + "/../img/icon.icns",
    executableName: "EDUcord",
    out: "./package",
    platform: [process.platform],
    overwrite: true
};

packager(options);
