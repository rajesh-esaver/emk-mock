
class Question {
    // correctOptionIdx 0,1,2,3
    constructor(question, options, correctOptionIdx) {
        this.question = question;
        this.options = options;
        this.correctOptionIdx = correctOptionIdx;
    }
}

class AnswerUpdate {

    constructor(isAnsweredCorrectly, correctOptionIdx, amountWon) {
        this.isAnsweredCorrectly = isAnsweredCorrectly;
        this.correctOptionIdx = correctOptionIdx;
        this.amountWon = amountWon;
    }
}

// time
var maxSeconds = 10;    // time in seconds
var currSeconds = maxSeconds;
var interval = 1000;
var isPaused = false;
var secondsEle = "";
var timer = "";
var currQuestion = "";
var isLifeLinesBeingShowed = true;
var revealAnswerButton;
var answerUpdateObj;
var lifeLines = ["Line 1", "Line 2", "Line 3"];

// questions
const options = ["Option A", "Option B", "Option C", "Option D"];
const questions = []
questions.push(new Question("Question 1, some long question to see how it's gonna display", options, 0))
questions.push(new Question("Question 2, what is it", options, 1))
questions.push(new Question("Question 3, which of it is", options, 2))
questions.push(new Question("Question 4, pick the one", options, 3))
questions.push(new Question("Question 5, which one", options, 1))

var socket = io.connect('http://127.0.0.1:5000');
var isSocketConnected = false;

socket.on('connect', function() {
    isSocketConnected = true;
});

function startTimer() {
    window.clearTimeout(timer);
    currSeconds = maxSeconds;
    isPaused = false;
    timer = setInterval(() => {
        if(!isPaused) {
            if(currSeconds >= 0) {
                secondsEle.innerHTML = parseInt(currSeconds);
                // sending the event to the server
                socket.emit("set_timer", currSeconds);
                currSeconds -= 1;
            } else {
                // timeout, send event
                window.clearTimeout(timer);
            }
        }
    }, interval);
}

function addEventListeners() {
    secondsEle = document.querySelector(".seconds");
    // buttons
    var pauseButton = document.getElementById("pause");
    var resumeButton = document.getElementById("resume");
    var lifeLinesButton = document.getElementById("btn_lifelines");
    revealAnswerButton = document.getElementById("btn_reveal_answer");

    revealAnswerButton.disabled = true;

    pauseButton.addEventListener("click", (e) => {
        e.preventDefault();
        pauseTimer()
    });

    resumeButton.addEventListener("click", (e) => {
        e.preventDefault();
        resumeTimer();
    });

    revealAnswerButton.addEventListener("click", (e) => {
        //console.log("answer "+currQuestion.options[0]);
        revealAnswerToContestant();
    });

    lifeLinesButton.addEventListener("click", (e) => {
        var divLifeLines = document.getElementById("div_lifelines");
        console.log(isLifeLinesBeingShowed);
        if(isLifeLinesBeingShowed) {
            $(".div_lifelines").hide();
        } else {
            $(".div_lifelines").show();
        }
        isLifeLinesBeingShowed = !isLifeLinesBeingShowed;
    });

}

function pauseTimer() {
    isPaused = true;
}

function resumeTimer() {
    isPaused = false;
}

function clearOptions() {

}

function revealAnswerToContestant() {
    revealAnswerButton.disabled = true;
    socket.emit("set_answer", answerUpdateObj);
}

function showCorrectAnswerToHost(selectedOptionIdx) {
    const option_a = document.getElementById("option_a");
    const option_b = document.getElementById("option_b");
    const option_c = document.getElementById("option_c");
    const option_d = document.getElementById("option_d");

    const txtAnswerStat = document.getElementById("txt_answer_stat");

    const correctOptionIdx = currQuestion.correctOptionIdx;

    answerUpdateObj = new AnswerUpdate(false, correctOptionIdx, 0);
    if(selectedOptionIdx == correctOptionIdx) {
        txtAnswerStat.innerHTML = "Right Answer";
        answerUpdateObj.isAnsweredCorrectly = true;
    } else {
        txtAnswerStat.innerHTML = "Wrong Answer";
        answerUpdateObj.isAnsweredCorrectly = false;
    }
}

function optionListener(button, selectedOptionIdx) {
    button.onclick = function() {
        pauseTimer();
        button.disabled = true;
        showCorrectAnswerToHost(selectedOptionIdx)
        socket.emit("set_locked_answer", selectedOptionIdx);
        revealAnswerButton.disabled = false;
    };
}

function questionListener(button, question) {
    button.onclick = function() {
        showQuestion(question);
        //button.style.background='#ffff';
        button.disabled = true;
        if(isSocketConnected) {
            //socket.send(question);
            socket.emit("set_question", question);
            startTimer();
        }
    };
}

function showQuestion(question) {
    currQuestion = question;
    // setting question text
    const txt_question = document.getElementById("txt_question");
    const txtAnswerStat = document.getElementById("txt_answer_stat");
    txt_question.innerHTML = question.question;

    // hiding answer text and reveal button
    txtAnswerStat.innerHTML = "";
    revealAnswerButton.disabled = true;


    // create dynamic option buttons
    const option_a = document.getElementById("option_a");
    const option_b = document.getElementById("option_b");
    const option_c = document.getElementById("option_c");
    const option_d = document.getElementById("option_d");

    // enabling all the options
    option_a.disabled = false;
    option_b.disabled = false;
    option_c.disabled = false;
    option_d.disabled = false;

    console.log(question.options);
    option_a.innerHTML = question.options[0];
    option_b.innerHTML = question.options[1];
    option_c.innerHTML = question.options[2];
    option_d.innerHTML = question.options[3];

    optionListener(option_a, 0);
    optionListener(option_b, 1);
    optionListener(option_c, 2);
    optionListener(option_d, 3);
}

function loadQuestions() {
    var questionsDev = document.getElementById("questions");
    //Append the element in page (in span).

    for(let i=0; i< options.length; i++) {
        let question = questions[i];

        var element = document.createElement("button");
        //Assign different attributes to the element.
        element.type = "button";
        element.innerHTML = "Question "+(i+1);
        element.className = 'btn-styled';

        questionListener(element, question);

        questionsDev.appendChild(element);
    }
}

$(document).ready(function() {
    addEventListeners();
    loadQuestions();
});