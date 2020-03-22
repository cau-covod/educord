#!/usr/bin/env node
const packager = require("electron-packager");

const options = {
    appBundleId: "EDUcord",
    arch: ["x64"],
    dir: ".",
    icon: __dirname + "/../img/icon.icns",
    executableName: "EDUcord",
    out: "./package",
    platform: ["darwin"],
    overwrite: true
};

packager(options);
