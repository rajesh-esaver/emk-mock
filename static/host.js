
var url = 'http://192.168.0.108:5000';
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
var pOptionA, pOptionB, pOptionC, pOptionD;
var divOptionA, divOptionB, divOptionC, divOptionD;
var divQuestion, divAnswer, pQuestion;
var tableQuestionsList, btnNextQuestion;
var lastViewedQuestionIdx = -1;

class Question {
    // correctOptionIdx 0,1,2,3
    constructor(question, options, correctOptionIdx, winAmount, amountWonForWrong, trivia, maxSeconds) {
        this.question = question;
        this.options = options;
        this.correctOptionIdx = correctOptionIdx;
        this.winAmount = winAmount;
        this.amountWonForWrong = amountWonForWrong;
        this.trivia = trivia;
        this.maxSeconds = maxSeconds;
    }
}

class AnswerUpdate {

    constructor(isAnsweredCorrectly, correctOptionIdx, amountWon) {
        this.isAnsweredCorrectly = isAnsweredCorrectly;
        this.correctOptionIdx = correctOptionIdx;
        this.amountWon = amountWon;
    }
}


// questions
const options = ["Option A", "Option B", "Option C", "Option D"];
const questions = []
/*
questions.push(new Question("Question 1, some long question to see how it's gonna display", options, 0, 1, 0, "explanation", 10))
questions.push(new Question("Question 2, what is it", options, 1, 10, 0, "right is 2", 10))
questions.push(new Question("Question 3, which of it is", options, 2, 100, 0, "answer 3", 15))
questions.push(new Question("Question 4, pick the one", options, 3, 1000, 0, "correct 4", 15))
questions.push(new Question("Question 5, which one", options, 1, 2000, 1000, "it's 5", 0))
*/

var socket = io.connect(url);
var isSocketConnected = false;

socket.on('connect', function() {
    isSocketConnected = true;
});

socket.on('get_question_set', function(questions_set) {
    //console.log(questions_set);
    for(let i=0; i < questions_set.length; i++) {
        const question_set = questions_set[i];
        question = new Question(question_set.question, question_set.options,
            question_set.correctOptionIdx,
            question_set.winAmount,
            question_set.amountWonForWrong,
            question_set.trivia,
            question_set.maxSeconds)
        console.log(question);
        questions.push(question);
    }
    addQuestionsToTable();
});

function startTimer(currMaxSeconds) {
    window.clearTimeout(timer);
    //currSeconds = maxSeconds;
    currSeconds = currMaxSeconds;
    if(currMaxSeconds == 0) {
        updateTimer("No Time Limit");
        return;
    }
    isPaused = false;
    timer = setInterval(() => {
        if(!isPaused) {
            if(currSeconds >= 0) {
                //secondsEle.innerHTML = parseInt(currSeconds);
                updateTimer(currSeconds);
                //spTimer.innerHTML = parseInt(currSeconds);
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
        hideShowNextQuestionOption(true);
    });

    btnNextQuestion.addEventListener("click", (e) => {
        loadNextQuestion();
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

function updateTimer(time) {
    secondsEle.innerHTML = time;
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
    const txtTrivia = document.getElementById("txt_trivia");
    showHideDivSection(divAnswer, true);

    const correctOptionIdx = currQuestion.correctOptionIdx;

    // showing answer trivia
    txtTrivia.innerHTML = currQuestion.trivia;
    answerUpdateObj = new AnswerUpdate(false, correctOptionIdx, currQuestion.winAmount);

    if(selectedOptionIdx == correctOptionIdx) {
        txtAnswerStat.innerHTML = "Right Answer, won - Rs."+String(currQuestion.winAmount);
        answerUpdateObj.isAnsweredCorrectly = true;
        applyCorrectAnswerStyle(getOptionDivByIndex(selectedOptionIdx));
    } else {
        txtAnswerStat.innerHTML = "Wrong Answer, won - Rs."+String(currQuestion.amountWonForWrong);
        answerUpdateObj.isAnsweredCorrectly = false;
        answerUpdateObj.amountWon = currQuestion.amountWonForWrong;
        applyWrongAnswerStyle(getOptionDivByIndex(selectedOptionIdx));
        applyCorrectAnswerStyle(getOptionDivByIndex(correctOptionIdx));
    }
}

function showHideDivSection(div, show) {
    if(show) {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
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
            startTimer(question.maxSeconds);
        }
    };
}

function showQuestion(question) {
    currQuestion = question;
    divOptionA.style.backgroundColor = "lightblue";
    divOptionB.style.backgroundColor = "lightblue";
    divOptionC.style.backgroundColor = "lightblue";
    divOptionD.style.backgroundColor = "lightblue";

    /*divQuestion.innerHTML = question.question;
    divOptionA.innerHTML = question.options[0];
    divOptionB.innerHTML = question.options[1];
    divOptionC.innerHTML = question.options[2];
    divOptionD.innerHTML = question.options[3];*/

    pQuestion.innerHTML = question.question;
    pOptionA.innerHTML = question.options[0];
    pOptionB.innerHTML = question.options[1];
    pOptionC.innerHTML = question.options[2];
    pOptionD.innerHTML = question.options[3];

    // hiding answer text and reveal button
    const txtAnswerStat = document.getElementById("txt_answer_stat");
    txtAnswerStat.innerHTML = "";
    revealAnswerButton.disabled = true;

    optionListener(divOptionA, 0);
    optionListener(divOptionB, 1);
    optionListener(divOptionC, 2);
    optionListener(divOptionD, 3);
}

function showQuestions(question) {
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

    for(let i=0; i< questions.length; i++) {
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

function addQuestionsToTable() {
    for(let i=questions.length-1; i >= 0; i--) {
        let question = questions[i];
        var row = tableQuestionsList.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);

        // question number
        cell1.innerHTML = i+1;
        // amount
        cell2.innerHTML = "Rs. " +question.winAmount;
    }
}

function hideShowNextQuestionOption(show) {
    if(show) {
        btnNextQuestion.disabled = false;
    } else {
        btnNextQuestion.disabled = true;
    }
}

function loadNextQuestion() {
    lastViewedQuestionIdx += 1;
    if(lastViewedQuestionIdx >= questions.length) {
        console.log("all questions read");
        return;
    }
    currQuestion = questions[lastViewedQuestionIdx];
    showQuestion(currQuestion);
    socket.emit("set_question", currQuestion);
    showHideDivSection(divAnswer, false);

    // marking time empty initially
    updateTimer("");

    // modifying table
    const currQuestionTableIdx = questions.length - lastViewedQuestionIdx;
    tableQuestionsList.rows[currQuestionTableIdx].cells[0].innerHTML = '<del>'+String(lastViewedQuestionIdx+1)+"</dev>";
    const price = tableQuestionsList.rows[currQuestionTableIdx].cells[1].innerHTML;
    tableQuestionsList.rows[currQuestionTableIdx].cells[1].innerHTML = '<del>'+String(price)+"</dev>";
    hideShowNextQuestionOption(false);
    startTimer(currQuestion.maxSeconds);
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
    pQuestion = document.getElementById("p_question");

    divOptionA = document.getElementById("div_option_a");
    divOptionB = document.getElementById("div_option_b");
    divOptionC = document.getElementById("div_option_c");
    divOptionD = document.getElementById("div_option_d");

    pOptionA = document.getElementById("p_option_a");
    pOptionB = document.getElementById("p_option_b");
    pOptionC = document.getElementById("p_option_c");
    pOptionD = document.getElementById("p_option_d");

    divAnswer = document.getElementById("div_answer");
    spTimer = document.getElementById("sp_timer");
    tableQuestionsList = document.getElementById("table_questions_list");
    btnNextQuestion = document.getElementById("btn_next_question");

}

function read_file_name_and_load() {
    const params = new URLSearchParams(window.location.search)
    file_name = params.get("file_name");
    if(file_name == null) {
        file_name = "template.csv";
    }
    socket.emit("get_question_set", file_name);
}

$(document).ready(function() {
    readElements();
    addEventListeners();
    read_file_name_and_load();
    //loadQuestions();
    //addQuestionsToTable();
    showHideDivSection(divAnswer, false);
});