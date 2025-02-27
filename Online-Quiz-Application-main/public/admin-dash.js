document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.topbar .toggle');
    const navigation = document.querySelector('.navigation');
    const main = document.querySelector('.main');
    const searchInput = document.querySelector('.search input');
    const quizTableBody = document.querySelector('.quizList tbody');
    const userProfileImage = document.getElementById('userProfileImage');
    const userList = document.getElementById('userList');
    const usersButton = document.getElementById('usersButton');

    const init = () => {
        updateProfileImage();
        loadQuizzes();
        handleSearch();
        handleNavigationToggle();
        addLinkHoverEffects();
        handleUserListToggle();
    };

    const handleNavigationToggle = () => {
        toggleButton.addEventListener('click', () => {
            navigation.classList.toggle('active');
            main.classList.toggle('active');
        });
    };

    const updateProfileImage = async () => {
        try {
            const response = await fetch('/api/admin-profile');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            userProfileImage.src = data.photo || '/imgs/default-user.png';
        } catch (error) {
            console.error('Error fetching admin profile:', error);
        }
    };

    const addLinkHoverEffects = () => {
        const links = document.querySelectorAll('.navigation a');
        links.forEach(link => {
            link.addEventListener('mouseover', () => link.closest('li').classList.add('hovered'));
            link.addEventListener('mouseout', () => link.closest('li').classList.remove('hovered'));
        });
    };

    const loadQuizzes = async () => {
        try {
            const response = await fetch('quizzes.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const quizzes = await response.json();
            quizTableBody.innerHTML = '';

            quizzes.forEach(quiz => {
                const row = document.createElement('tr');
                const numberOfQuestions = quiz.questions ? parseInt(quiz.questions) : 0;

                row.innerHTML = `
                    <td>${quiz.name}</td>
                    <td>${numberOfQuestions}</td>
                    <td>${quiz.usersCount}</td>
                    <td>${quiz.status}</td>
                `;

                if (quiz.status.toLowerCase() === 'active' && quiz.url) {
                    row.style.cursor = 'pointer';
                    row.addEventListener('click', () => {
                        window.location.href = quiz.url;
                    });
                } else {
                    row.style.opacity = '0.5';
                }

                quizTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading quizzes:', error);
        }
    };

    const handleSearch = () => {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const quizRows = document.querySelectorAll('.quizList tbody tr');

            quizRows.forEach(row => {
                const quizName = row.querySelector('td').textContent.toLowerCase();
                row.style.display = quizName.includes(searchTerm) ? '' : 'none';
            });
        });
    };

    const handleUserListToggle = () => {
        usersButton.addEventListener('click', () => {
            userList.style.display = userList.style.display === 'none' ? 'block' : 'none';
            loadUserList();
        });
    };

    const loadUserList = async () => {
        try {
            const response = await fetch('/api/user-list');
            if (!response.ok) throw new Error('Network response was not ok');
            const users = await response.json();
            const userListTableBody = document.querySelector('#userListTable tbody');
            userListTableBody.innerHTML = '';

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.status}</td>
                `;
                userListTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    init();
});
