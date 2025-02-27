document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".settings-link");
    const sections = document.querySelectorAll(".settings-section");
    const updatePhotoForm = document.getElementById("updatePhotoForm");
    const successMessageDiv = document.getElementById("successMessage");
    const errorMessageDiv = document.getElementById("errorMessage");

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetSelector = link.getAttribute("data-target");
            const target = document.querySelector(targetSelector);

            sections.forEach(section => section.classList.add("hidden"));
            if (target) {
                target.classList.remove("hidden");
            }
        });
    });

    updateProfileImage();

    if (updatePhotoForm) {
        updatePhotoForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(updatePhotoForm);
            
            try {
                const response = await fetch('/updateAdminPhoto', { 
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Network response was not ok');
                }

                const data = await response.json();
                updateProfileImage();
                
                displayMessage(successMessageDiv, data.message || 'Photo updated successfully!', 'success');
                
                setTimeout(() => {
                    window.location.href = '/admin-dashboard.html'; 
                }, 1500);
            } catch (error) {
                console.error('Error updating photo:', error);
                displayMessage(errorMessageDiv, 'Failed to update photo. Please try again.', 'error');
            }
        });
    }

    const changePasswordForm = document.querySelector('#changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            fetch('/changeAdminPassword', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error);
                    });
                }
                return response.json();
            })
            .then(data => {
                displayMessage(successMessageDiv, 'Password changed successfully!', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                displayMessage(errorMessageDiv, 'Error changing password: ' + error.message, 'error');
            });
        });
    }
});

const updateProfileImage = () => {
    const userProfileImage = document.getElementById("userProfileImage");
    
    fetch('/api/admin-profile')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch admin profile');
            }
            return response.json();
        })
        .then(data => {
            userProfileImage.src = data.photo || '/imgs/default-admin.png';
        })
        .catch(error => {
            console.error('Error fetching admin profile:', error);
            userProfileImage.src = '/imgs/default-admin.png';
        });
};

const displayMessage = (element, message, type) => {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
        element.style.color = type === 'success' ? 'green' : 'red';
    }
};
