document.addEventListener('DOMContentLoaded', () => {
    const quizListElement = document.getElementById('quizList');
    const userProfileImage = document.getElementById('userProfileImage');
    const userNameElement = document.getElementById("userName");
    let currentUser = null;

    fetch('/quizzes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch quizzes: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => displayQuizzes(data))
        .catch(error => console.error('Error fetching quizzes:', error));

    function displayQuizzes(quizzes) {
        quizListElement.innerHTML = '';

        if (!Array.isArray(quizzes)) {
            console.error('Quizzes data is not an array', quizzes);
            return;
        }

        quizzes.forEach(quiz => {
            const listItem = document.createElement('li');
            const quizButton = document.createElement('button');

            quizButton.textContent = quiz.name || 'No Name';
            quizButton.className = 'quiz-button';

            quizButton.addEventListener('click', (event) => {
                console.log(`Clicked on quiz: ${quiz.name}`);
                showQuizResults(quiz.name);
            });

            listItem.appendChild(quizButton);
            quizListElement.appendChild(listItem);
        });
    }

    function showQuizResults(quizName) {
        console.log(`Fetching results for quiz: ${quizName}`);
        fetch('/quizResults.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch quiz results: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Quiz Results Data:', data);

                if (!currentUser) {
                    alert('You need to be logged in to see your results.');
                    return;
                }

                const results = data.filter(r => r.quizName === quizName && r.user === currentUser.username);
                if (results.length > 0) {
                    displayResults(results);
                } else {
                    alert(`No results found for ${quizName}. Please make sure you've completed the quiz.`);
                }
            })
            .catch(error => console.error('Error fetching quiz results:', error));
    }

    function displayResults(results) {
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'result-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Username</th>
                <th>Score</th>
                <th>Total Questions</th>
                <th>Correct Answers</th>
                <th>Score Percentage</th>
                <th>Date</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.user}</td>
                <td>${result.userScore}</td>
                <td>${result.totalQuestions}</td>
                <td>${result.correctAnswers}</td>
                <td>${result.scorePercentage}%</td>
                <td>${new Date(result.date).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        resultContainer.appendChild(table);
    }

    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user-profile');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            userProfileImage.src = data.photo || '/imgs/default-user.png';
            userNameElement.textContent = data.username || "Guest";
            currentUser = data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            userProfileImage.src = '/imgs/default-user.png';
            userNameElement.textContent = "Guest";
        }
    }

    loadUserProfile();
});
