const { ipcRenderer } = require("electron");

const form = document.getElementById("login-form");
const alert = document.getElementById("wrong-login-alert");

/**
 * Attach listener to submit event of login-form.
 */
form.addEventListener("submit", (el, evt) => {
    el.preventDefault();

    const $username = document.getElementById("inputUsername");
    const $password = document.getElementById("inputPassword");
    ipcRenderer.send("login:submit", {
        username: $username.value,
        password: $password.value
    });
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
