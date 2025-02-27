const scoreElement = document.getElementById("score");
const totalQuestionsElement = document.getElementById("totalQuestions");
const correctAnswersElement = document.getElementById("correctAnswers");
const scorePercentageElement = document.getElementById("scorePercentage");
const answersListElement = document.getElementById("answersList");

let quizFilePath = localStorage.getItem("quizFilePath") || '/questions.json';
const userScore = localStorage.getItem("score") || 0;
let userName = "Guest";
const quizName = localStorage.getItem("currentQuizName") || "Unknown Quiz";

async function loadUserProfile() {
    try {
        const response = await fetch('/api/user-profile');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        userName = data.username || "Guest";
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

async function loadResults() {
    console.log("Loading results...");
    console.log("Quiz file path being loaded:", quizFilePath);

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.innerText = 'Loading results...';
    document.body.appendChild(loadingIndicator);

    try {
        await loadUserProfile();
        const response = await fetch(quizFilePath);
        
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        
        const quizQuestions = await response.json();
        console.log("Fetched quiz questions:", quizQuestions);

        const totalQuestions = quizQuestions.length;
        const correctAnswers = userScore;

        console.log("Total questions from quiz:", totalQuestions);
        console.log("User score (correct answers):", correctAnswers);

        const scorePercentage = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(2) : 0;

        scoreElement.innerText = userScore;
        totalQuestionsElement.innerText = totalQuestions;
        correctAnswersElement.innerText = correctAnswers;
        scorePercentageElement.innerText = `${scorePercentage}%`;

        answersListElement.innerHTML = '';
        quizQuestions.forEach((question, index) => {
            const listItem = document.createElement("li");
            listItem.innerText = `${index + 1}. ${question.question} - Correct Answer: ${question[`opt${question.correct.slice(-1)}`]}`;
            answersListElement.appendChild(listItem);
        });

        await saveResults(quizName, userName, userScore, totalQuestions, correctAnswers, scorePercentage);

    } catch (error) {
        console.error('Error loading quiz data:', error);
        answersListElement.innerHTML = `<p>Error loading quiz questions. Please try again later.</p>`;
    } finally {
        document.body.removeChild(loadingIndicator);
    }
}

async function saveResults(quizName, user, userScore, totalQuestions, correctAnswers, scorePercentage) {
    const results = {
        quizName,
        user,
        userScore,
        totalQuestions,
        correctAnswers,
        scorePercentage,
    };

    console.log('Sending results to server:', results);
    localStorage.setItem('quizResults', JSON.stringify(results));

    try {
        const response = await fetch('/save-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(results),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Failed to save results on server: ' + errorText);
        }

        const responseData = await response.json();
        console.log(responseData.message);
    } catch (error) {
        console.error('Error saving results to server:', error);
    }
}

window.onload = loadResults;
