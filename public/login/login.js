const { ipcRenderer } = require("electron");

const form = document.getElementById("login-form");

/**
 * Attach listener to submit event of login-form.
 */
form.addEventListener("submit", (el, evt) => {
    el.preventDefault();

    const $mail = document.getElementById("inputEmail");
    const $password = document.getElementById("inputPassword");

    ipcRenderer.send("login:submit", {
        username: $mail,
        pasword: $password
    });
});

/**
 * Handle the login-response.
 */
ipcRenderer.on("login:response", (evt, arg) => {
    if (arg.success) {
        window.location.replace("../main/main.html");
    }
});
