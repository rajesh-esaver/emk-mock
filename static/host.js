
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

    pauseButton.addEventListener("click", (e) => {
        e.preventDefault();
        isPaused = true;
    });

    resumeButton.addEventListener("click", (e) => {
        e.preventDefault();
        isPaused = false;
    });

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

        element.onclick = function() { // Note this is a function
            console.log(question.question);
            if(isSocketConnected) {
                socket.send(question);
                startTimer();
            }
        };

        questionsDev.appendChild(element);
    }
}

$(document).ready(function() {
    addEventListeners();
    loadQuestions();
});