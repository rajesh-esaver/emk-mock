

var socket = io.connect('http://127.0.0.1:5000');
var divTable = "";
var divOptionA, divOptionB, divOptionC, divOptionD;
var divQuestion;
var currLockedOptionIdx = "";

socket.on('connect', function() {
    socket.send("client connect");
});

socket.on('message', function(msg) {
    console.log(msg);
});

socket.on('curr_timer', function(msg) {
    console.log(msg);
});

socket.on('question', function(questionObj) {
    // show question
    console.log(questionObj);
    showHideTableDiv(true);
    showQuestion(questionObj);
});

socket.on('locked_answer', function(msg) {
    // locked answer
    //console.log(msg);
    const selectedOptionIdx = msg;
    currLockedOptionIdx = selectedOptionIdx;
    setLockedAnswer(selectedOptionIdx);
});

socket.on('answer', function(answerObj) {
    // show answer
    console.log(answerObj);
    revealAnswer(answerObj);
});

function showHideTableDiv(show) {
    if(show) {
        divTable.style.display = "block";
    } else {
        divTable.style.display = "none";
    }
}

function revealAnswer(answerObj) {
    const optionDiv = getOptionDivByIndex(currLockedOptionIdx);
    if(currLockedOptionIdx != answerObj.correctOptionIdx) {
        // wrong answer, stop
        // marking current selected option as wrong
        applyWrongAnswerStyle(optionDiv);
        // marking correct option as answer
        applyCorrectAnswerStyle(getOptionDivByIndex(answerObj.correctOptionIdx));
    } else {
        // right answer, show won amount
        // marking current selected option as right
        applyCorrectAnswerStyle(optionDiv);
        //showHideTableDiv(false);
    }
}

function showQuestion(question) {
    divOptionA.style.backgroundColor = "lightblue";
    divOptionB.style.backgroundColor = "lightblue";
    divOptionC.style.backgroundColor = "lightblue";
    divOptionD.style.backgroundColor = "lightblue";

    divQuestion.innerHTML = question.question;
    divOptionA.innerHTML = question.options[0];
    divOptionB.innerHTML = question.options[1];
    divOptionC.innerHTML = question.options[2];
    divOptionD.innerHTML = question.options[3];
}

function getOptionDivByIndex(optionIdx) {
    var selectedDiv = "";
    if(optionIdx == 0) {
        selectedDiv = divOptionA;
    } else if(optionIdx == 1) {
        selectedDiv = divOptionB;
    } else if(optionIdx == 2) {
        selectedDiv = divOptionC;
    } else if(optionIdx == 3) {
        selectedDiv = divOptionD;
    }
    return selectedDiv;
}

function setLockedAnswer(selectedOptionIdx) {
    var selectedDiv = "";
    selectedDiv = getOptionDivByIndex(selectedOptionIdx);
    applyLockedAnswerStyle(selectedDiv);
}

function applyLockedAnswerStyle(optionDiv) {
    optionDiv.style.backgroundColor = "yellow";
}

function applyCorrectAnswerStyle(optionDiv) {
    optionDiv.style.backgroundColor = "green";
}

function applyWrongAnswerStyle(optionDiv) {
    optionDiv.style.backgroundColor = "red";
}

function readElements() {
    divTable = document.getElementById("div_table");
    divQuestion = document.getElementById("div_question");
    divOptionA = document.getElementById("div_option_a");
    divOptionB = document.getElementById("div_option_b");
    divOptionC = document.getElementById("div_option_c");
    divOptionD = document.getElementById("div_option_d");
}

$(document).ready(function() {
    readElements();
    showHideTableDiv(false);
});