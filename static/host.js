
class Question {
    constructor(question, options) {
        this.question = question;
        this.options = options;
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
var lifeLines = ["Line 1", "Line 2", "Line 3"];

// questions
const options = ["Option A", "Option B", "Option C", "Option D"];
const questions = []
questions.push(new Question("Question 1", options))
questions.push(new Question("Question 2", options))
questions.push(new Question("Question 3", options))
questions.push(new Question("Question 4", options))
questions.push(new Question("Question 5", options))

var socket = io.connect('http://127.0.0.1:5000');
var isSocketConnected = false;

socket.on('connect', function() {
    isSocketConnected = true;
});

function startTimer() {
    window.clearTimeout(timer);
    currSeconds = maxSeconds;
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
    var answerButton = document.getElementById("btn_answer");

    pauseButton.addEventListener("click", (e) => {
        e.preventDefault();
        //isPaused = true;
        pauseTimer()
    });

    resumeButton.addEventListener("click", (e) => {
        e.preventDefault();
        //isPaused = false;
        resumeTimer();
    });

    answerButton.addEventListener("click", (e) => {
        console.log("answer "+currQuestion.options[0]);
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

function optionListener(button, option) {
    button.onclick = function() {
        pauseTimer();
        button.style.background='#ffff';
        socket.emit("set_locked_answer", option);
    };
}

function questionListener(button, question) {
    button.onclick = function() {
        showQuestion(question);
        button.style.background='#ffff';
        if(isSocketConnected) {
            socket.send(question);
            startTimer();
        }
    };
}

function showQuestion(question) {
    currQuestion = question;
    const txt_question = document.getElementById("txt_question");
    txt_question.innerHTML = question.question;

    // create dynamic option buttons
    const option_a = document.getElementById("option_a");
    const option_b = document.getElementById("option_b");
    const option_c = document.getElementById("option_c");
    const option_d = document.getElementById("option_d");

    console.log(question.options);
    option_a.innerHTML = question.options[0];
    option_b.innerHTML = question.options[1];
    option_c.innerHTML = question.options[2];
    option_d.innerHTML = question.options[3];

    optionListener(option_a, 0);
    optionListener(option_b, 0);
    optionListener(option_c, 0);
    optionListener(option_d, 0);
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