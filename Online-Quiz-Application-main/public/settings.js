document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".settings-link");
    const sections = document.querySelectorAll(".settings-section");

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("data-target"));

            sections.forEach(section => {
                section.classList.add("hidden");
            });

            target.classList.remove("hidden");
        });
    });

    loadUserProfile();

    const changePasswordForm = document.querySelector('#changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);

            fetch('/changePassword', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
                return response.text();
            })
            .then(data => {
                displayMessage(data, true);
            })
            .catch(error => {
                console.error('Error:', error);
                displayMessage('Error changing password: ' + error.message, false);
            });
        });
    }
});

async function loadUserProfile() {
    const userProfileImage = document.getElementById("userProfileImage");
    const userNameElement = document.getElementById("userName");

    if (!userProfileImage || !userNameElement) {
        console.error("Profile image or username element not found in the DOM.");
        return;
    }

    try {
        const response = await fetch('/api/user-profile');
        console.log("Profile fetch response:", response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fetch error response:", errorText);
            throw new Error('Network response was not ok: ' + errorText);
        }

        const data = await response.json();
        console.log("User profile data received:", data);

        userProfileImage.src = data.photo || '/imgs/default-user.png';
        userNameElement.textContent = data.username || "Guest";
    } catch (error) {
        console.error('Error fetching user profile:', error);
        userProfileImage.src = '/imgs/default-user.png';
        userNameElement.textContent = "Guest";
    }
}

function displayMessage(message, isSuccess) {
    const messageDiv = isSuccess ? document.getElementById("successMessage") : document.getElementById("errorMessage");
    const hiddenDiv = isSuccess ? document.getElementById("errorMessage") : document.getElementById("successMessage");

    hiddenDiv.classList.add("hidden");
    messageDiv.textContent = message;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
        messageDiv.classList.add("hidden");
        messageDiv.textContent = "";
    }, 5000);
}
