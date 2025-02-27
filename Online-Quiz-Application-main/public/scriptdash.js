document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.topbar .toggle');
    const navigation = document.querySelector('.navigation');
    const main = document.querySelector('.main');
    const searchInput = document.querySelector('.search input');
    const quizTableBody = document.querySelector('.quizList tbody');
    const userProfileImage = document.getElementById('userProfileImage');
    const userNameDisplay = document.getElementById('userName');

    const init = () => {
        updateProfileImage();
        loadQuizzes();
        handleSearch();
        handleNavigationToggle();
        addLinkHoverEffects();
    };

    const handleNavigationToggle = () => {
        toggleButton.addEventListener('click', () => {
            navigation.classList.toggle('active');
            main.classList.toggle('active');
        });
    };

    const updateProfileImage = async () => {
        try {
            const response = await fetch('/api/user-profile');
            const data = await response.json();
            userProfileImage.src = data.photo || '/imgs/default-user.png';
            userNameDisplay.textContent = data.username || 'Guest';
        } catch (error) {
            console.error('Error fetching user profile:', error);
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
                        const selectedQuizName = quiz.name;
                        localStorage.setItem("currentQuizName", selectedQuizName);
                        localStorage.setItem("quizFilePath", quiz.filePath);
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

    document.addEventListener("DOMContentLoaded", () => {
        const userEmail = 'user@example.com';
        const quizTableBody = document.querySelector('tbody');

        Promise.all([
            fetch('/api/quizzes'),
            fetch(`/api/quiz-results?user=${userEmail}`)
        ])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(([quizzes, results]) => {
            const completedQuizzes = new Set(results.map(result => result.quizName));

            quizzes.forEach(quiz => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${quiz.name}</td>
                    <td>${quiz.questions.length}</td>
                    <td>${quiz.users}</td>
                    <td>
                        <button class="quiz-button" data-quiz="${quiz.name}">
                            ${completedQuizzes.has(quiz.name) ? 'Completed' : 'Take Quiz'}
                        </button>
                    </td>
                `;
                quizTableBody.appendChild(row);

                row.querySelector('.quiz-button').addEventListener('click', () => {
                    if (completedQuizzes.has(quiz.name)) {
                        alert('You have already completed this quiz.');
                    } else {
                        window.location.href = `quiz.html?quiz=${quiz.name}`;
                    }
                });
            });
        })
        .catch(err => console.error('Error loading quizzes or results:', err));
    });

    init();
});
