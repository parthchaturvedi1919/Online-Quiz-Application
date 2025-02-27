async function fetchUserData() {
    try {
        const response = await fetch('/users.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const users = await response.json();
        const regularUsers = users.filter(user => !user.isAdmin);
        populateUserTable(regularUsers);
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data. Please try again later.');
    }
}

function populateUserTable(users) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><img src="${user.photo || '/imgs/default-user.png'}" alt="${user.username}'s photo" width="50"></td>
            <td>${user.isAdmin ? 'admin' : 'User'}</td>
        `;
        userTableBody.appendChild(row);
    });
}

function fetchUserProfile() {
    fetch('/api/admin-profile')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Profile data received:', data);
            const userImage = document.querySelector('.user img');
            if (data && data.photo) {
                userImage.src = data.photo;
            } else {
                userImage.src = 'imgs/default-user.jpg';
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });
}

window.onload = () => {
    fetchUserData();
    fetchUserProfile();
};
