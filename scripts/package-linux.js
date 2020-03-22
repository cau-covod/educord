#!/usr/bin/env node
const packager = require("electron-packager");

const options = {
    appBundleId: "EDUcord",
    arch: ["x64", "ia32"],
    dir: ".",
    executableName: "EDUCord",
    out: "./package",
    platform: ["linux"],
    overwrite: true
};

packager(options);
