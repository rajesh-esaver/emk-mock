
class Question {
    constructor(question, options) {
        this.question = question;
        this.options = options;
    }
}

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
            }
        };

        questionsDev.appendChild(element);
    }
}

$(document).ready(function() {
    loadQuestions();
});