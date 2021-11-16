

var socket = io.connect('http://127.0.0.1:5000');
var divTable = "";
var divOptionA, divOptionB, divOptionC, divOptionD;

socket.on('connect', function() {
    socket.send("client connect");
});

socket.on('message', function(msg) {
    console.log(msg);
});

socket.on('curr_timer', function(msg) {
    console.log(msg);
});

socket.on('question', function(msg) {
    // show question
    console.log(msg);
    showHideTableDiv(true);
    showQuestion(msg);
});

socket.on('locked_answer', function(msg) {
    // locked answer
    //console.log(msg);
    const selectedOptionIdx = msg;
    setLockedAnswer(selectedOptionIdx);
});

socket.on('answer', function(msg) {
    // show answer
    console.log(msg);
    showHideTableDiv(false);
});

function showHideTableDiv(show) {
    if(show) {
        divTable.style.display = "block";
    } else {
        divTable.style.display = "none";
    }
}

function showQuestion(question) {
    divOptionA.style.backgroundColor = "lightblue";
    divOptionB.style.backgroundColor = "lightblue";
    divOptionC.style.backgroundColor = "lightblue";
    divOptionD.style.backgroundColor = "lightblue";
}

function setLockedAnswer(selectedOptionIdx) {
    var selectedDiv = ""
    if(selectedOptionIdx == 0) {
        selectedDiv = divOptionA;
    } else if(selectedOptionIdx == 1) {
        selectedDiv = divOptionB;
    } else if(selectedOptionIdx == 2) {
        selectedDiv = divOptionC;
    } else if(selectedOptionIdx == 3) {
        selectedDiv = divOptionD;
    }
    applyLockedAnswerStyle(selectedDiv);
}

function applyLockedAnswerStyle(optionDiv) {
    optionDiv.style.backgroundColor = "red";
}

function readElements() {
    divTable = document.getElementById("div_table");
    divOptionA = document.getElementById("div_option_a");
    divOptionB = document.getElementById("div_option_b");
    divOptionC = document.getElementById("div_option_c");
    divOptionD = document.getElementById("div_option_d");
}

$(document).ready(function() {
    readElements();
    showHideTableDiv(false);
});