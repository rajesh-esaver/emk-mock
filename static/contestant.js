

var socket = io.connect('http://127.0.0.1:5000');
var divTable = "";

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

function readElements() {
    divTable = document.getElementById("div_table");
}

$(document).ready(function() {
    readElements();
    showHideTableDiv(false);
});