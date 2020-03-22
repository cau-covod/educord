#!/usr/bin/env node
const packager = require("electron-packager");

const options = {
    appBundleId: "EDUcord",
    arch: ["x64", "ia32"],
    dir: ".",
    icon: __dirname + "/../img/icon.ico",
    executableName: "EDUcord",
    out: "./package",
    platform: ["win32"],
    overwrite: true
};

packager(options);
