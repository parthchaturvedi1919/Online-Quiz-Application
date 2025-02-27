let question_number_element = document.getElementById("question-number");
let question_txt_element = document.getElementById("question-txt");
let option_1_element = document.getElementById("option1");
let option_2_element = document.getElementById("option2");
let option_3_element = document.getElementById("option3");
let option_4_element = document.getElementById("option4");
let next_button = document.getElementById("next-button");
let timer_element = document.getElementById("timer");

let current_question_number = 0;
let score = 0;
let time;
const total_minutes = 60;
let sec = total_minutes * 60;

function timer() {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    timer_element.innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    sec--;

    if (sec < 0) {
        clearInterval(time);
        goToResultPage();
    }
}

function checkIfScore() {
    let optionIdSelected = document.querySelector('input[name=opt]:checked');
    let option_correct = quizQuestions[current_question_number].correct;
    if (optionIdSelected != null) {
        if (optionIdSelected.id == option_correct) {
            score++;
        }
    }
}

function showQuestion() {
    document.querySelectorAll("input[name=opt]").forEach(option => option.checked = false);

    if (current_question_number >= quizQuestions.length) {
        goToResultPage();
    }

    question_number_element.innerHTML = (current_question_number + 1) + ". ";
    question_txt_element.innerHTML = quizQuestions[current_question_number].question;
    option_1_element.innerHTML = quizQuestions[current_question_number].opt1;
    option_2_element.innerHTML = quizQuestions[current_question_number].opt2;
    option_3_element.innerHTML = quizQuestions[current_question_number].opt3;
    option_4_element.innerHTML = quizQuestions[current_question_number].opt4;
}

next_button.addEventListener('click', () => {
    checkIfScore();
    current_question_number++;
    if (current_question_number >= quizQuestions.length) {
        goToResultPage();
    } else {
        showQuestion();
    }
});

function goToResultPage() {
    current_question_number = 0;
    localStorage.setItem("score", score);
    location.href = "./resultPage.html";
}

let quizQuestions = [];
const URL = 'questions3.json';

async function getData() {
    const response = await fetch(URL);
    const data = await response.json();
    quizQuestions = data;
    console.log(quizQuestions);
    showQuestion();
    localStorage.setItem("quizFilePath", "questions3.json");
}

timer();
time = setInterval(timer, 1000);
getData();
