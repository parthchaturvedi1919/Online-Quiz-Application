document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.toggle');
    const navigation = document.querySelector('.navigation');
    const main = document.querySelector('.main');
    const addQuizButton = document.querySelector('.add-quiz');
    const quizTableBody = document.getElementById('quiz-table-body');
    const modal = document.getElementById("quizModal");
    const closeModal = document.querySelector(".close");
    const quizForm = document.getElementById("quizForm");
    
    let currentQuiz = null;

    toggleButton.addEventListener('click', () => {
        navigation.classList.toggle('active');
        main.classList.toggle('active');
    });

    function fetchUserProfile() {
        fetch('/api/admin-profile')
            .then(response => response.json())
            .then(data => {
                const userImage = document.querySelector('.user img');
                userImage.src = data.photo || 'imgs/default-user.jpg';
                userImage.alt = "User Profile Picture";
            })
            .catch(error => console.error('Error fetching user profile:', error));
    }

    function fetchQuizzes() {
        fetch('/api/quizzes')
            .then(response => response.json())
            .then(data => {
                quizTableBody.innerHTML = '';
                data.forEach(quiz => addQuizToTable(quiz));
            })
            .catch(error => console.error('Error fetching quizzes:', error));
    }

    function addQuizToTable(quiz) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${quiz.name}</td>
            <td>${quiz.questions}</td>
            <td>${quiz.filePath}</td>
            <td>${quiz.usersCount}</td>
            <td>${quiz.status}</td>
            <td>${quiz.url}</td>
            <td class="actions">
                <a href="#" class="edit-quiz">Edit</a> | 
                <a href="#" class="delete-quiz">Delete</a>
            </td>
        `;

        newRow.querySelector('.delete-quiz').addEventListener('click', (event) => {
            event.preventDefault();
            const confirmation = confirm("Are you sure you want to delete this quiz?");
            if (confirmation) {
                deleteQuiz(quiz.name, newRow);
            }
        });

        newRow.querySelector('.edit-quiz').addEventListener('click', (event) => {
            event.preventDefault();
            currentQuiz = quiz;
            openModalForEdit(quiz);
        });

        quizTableBody.appendChild(newRow);
    }

    function openModalForEdit(quiz) {
        modal.style.display = "block";
        document.getElementById('quiz-name').value = quiz.name;
        document.getElementById('questions-count').value = quiz.questions;
        document.getElementById('file-path').value = quiz.filePath;
        document.getElementById('users-count').value = quiz.usersCount;
        document.getElementById('quiz-status').value = quiz.status;
        document.getElementById('quiz-url').value = quiz.url;
    }

    function deleteQuiz(quizName, rowElement) {
        fetch(`/api/delete-quiz?name=${encodeURIComponent(quizName)}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete quiz');
                quizTableBody.removeChild(rowElement);
            })
            .catch(error => console.error('Error deleting quiz:', error));
    }

    addQuizButton.addEventListener('click', () => {
        currentQuiz = null;
        quizForm.reset();
        modal.style.display = "block";
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newQuiz = {
            name: document.getElementById('quiz-name').value,
            questions: parseInt(document.getElementById('questions-count').value) || 0,
            filePath: document.getElementById('file-path').value || 'questions_.json',
            usersCount: parseInt(document.getElementById('users-count').value) || 0,
            status: document.getElementById('quiz-status').value || 'Active',
            url: document.getElementById('quiz-url').value || '_page.html'
        };

        if (currentQuiz) {
            updateQuiz(currentQuiz.name, newQuiz);
        } else {
            addQuiz(newQuiz);
        }

        modal.style.display = "none";
        quizForm.reset();
    });

    function addQuiz(newQuiz) {
        fetch('/api/add-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newQuiz)
        })
            .then(response => response.json())
            .then(() => {
                fetchQuizzes();
            })
            .catch(error => console.error('Error adding quiz:', error));
    }

    function updateQuiz(oldName, updatedQuiz) {
        fetch(`/api/update-quiz?name=${encodeURIComponent(oldName)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedQuiz)
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update quiz');
                fetchQuizzes();
            })
            .catch(error => console.error('Error updating quiz:', error));
    }

    document.getElementById("cancelQuizButton").addEventListener("click", () => {
        modal.style.display = "none";
    });

    fetchUserProfile();
    fetchQuizzes();
});
