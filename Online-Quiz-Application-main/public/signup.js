function validatePassword() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const passwordError = document.getElementById("passwordError");
    const submitButton = document.getElementById("submit");

    if (password !== confirmPassword) {
        passwordError.textContent = "Passwords do not match!";
        submitButton.disabled = true;
    } else {
        passwordError.textContent = "";
        submitButton.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    passwordInput.addEventListener("input", validatePassword);
    confirmPasswordInput.addEventListener("input", validatePassword);
});
