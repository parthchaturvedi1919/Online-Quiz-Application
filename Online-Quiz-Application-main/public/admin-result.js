document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector(".toggle");
    const navigation = document.querySelector(".navigation");
    const mainContent = document.querySelector(".main");

    toggleButton.addEventListener("click", () => {
        navigation.classList.toggle("active");
        mainContent.classList.toggle("active");
    });
});

async function fetchUserData() {
    try {
        const response = await fetch('/users.json');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const users = await response.json();
        const regularUsers = users.filter(user => !user.isAdmin); 
        const adminUser = users.find(user => user.isAdmin);
        populateUserTable(regularUsers);
        if (adminUser) {
            updateAdminProfile(adminUser);
        }
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
            <td>${user.isAdmin ? 'Admin' : 'User'}</td>
        `;
        row.addEventListener('click', () => fetchQuizResults(user.username));
        userTableBody.appendChild(row);
    });
}

function updateAdminProfile(adminUser) {
    const userProfileImage = document.getElementById('userProfileImage');
    if (adminUser.photo) {
        userProfileImage.src = adminUser.photo;
    } else {
        userProfileImage.src = '/imgs/admin-default.png';
    }
    userProfileImage.alt = `${adminUser.username}'s profile photo`;
}

async function fetchQuizResults(username) {
    try {
        const response = await fetch('/quizResults.json');
        if (!response.ok) {
            throw new Error('Failed to fetch quiz results');
        }
        const quizzes = await response.json();
        const userQuizzes = quizzes.filter(quiz => quiz.user === username);
        displayQuizResults(username, userQuizzes);
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        alert('Failed to fetch quiz results. Please try again later.');
    }
}

function displayQuizResults(username, quizzes) {
    const quizResultsSection = document.getElementById('quizResultsSection');
    const userQuizTitle = document.getElementById('userQuizTitle');
    const quizResultsBody = document.getElementById('quizResultsBody');

    userQuizTitle.textContent = `Quiz Results for ${username}`;
    quizResultsBody.innerHTML = '';

    if (quizzes.length === 0) {
        const noDataMessage = document.createElement('tr');
        noDataMessage.innerHTML = `<td colspan="6">User didn't take any quiz.</td>`;
        quizResultsBody.appendChild(noDataMessage);
    } else {
        quizzes.forEach(quiz => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${quiz.quizName}</td>
                <td>${quiz.userScore}</td>
                <td>${quiz.correctAnswers}</td>
                <td>${quiz.totalQuestions}</td>
                <td>${quiz.scorePercentage}%</td>
                <td>${new Date(quiz.date).toLocaleString()}</td>
            `;
            quizResultsBody.appendChild(row);
        });
    }

    quizResultsSection.style.display = 'block';
}

window.onload = () => {
    fetchUserData();
};
