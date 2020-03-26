const { ipcRenderer } = require("electron");

const form = document.getElementById("login-form");
const alert = document.getElementById("wrong-login-alert");

const $serverURL = document.getElementById("inputServerURL");
const $username = document.getElementById("inputUsername");
const $password = document.getElementById("inputPassword");

/**
 * Attach listener to submit event of login-form.
 */
form.addEventListener("submit", (el, evt) => {
    el.preventDefault();

    ipcRenderer.send("login:submit", {
        serverURL: $serverURL.value,
        username: $username.value,
        password: $password.value
    });
});

/**
 * Send an init event at load to get the
 * default server URL.
 */
window.addEventListener("load", () => {
    ipcRenderer.send("login:init");
});

ipcRenderer.on("login:setServerURL", (evt, arg) => {
    $serverURL.value = arg.value;
});

/**
 * Handle the login-response.
 */
ipcRenderer.on("login:response", (evt, arg) => {
    if (arg.success) {
        window.location.replace("../main/main.html");
    } else {
        alert.classList.add("show");
    }
});
