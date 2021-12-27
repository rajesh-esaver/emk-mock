
//var url = 'http://192.168.1.48:5000';
var url = getServerBaseUrl();
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
var currRightOptionIdx, isLockedCurrQuestion = false;
var lifeLines = ["Line 1", "Line 2", "Line 3"];


var divQuestionBack, divQuestionText;
var divOptionABack, divOptionBBack, divOptionCBack, divOptionDBack;
var divOptionAText, divOptionBText, divOptionCText, divOptionDText;
var divAnswer, divQuestionTable;

var tableQuestionsList, btnNextQuestion;
var lifeline1, lifeline2, lifeline3, btnShowLifelines, btnHideLifelines, diveLifelines;
var btnShowAudienceData, btnActivate5050;
var divAudiencePoll, divAudiencePollChart;
var lastViewedQuestionIdx = -1;
var lifeLinesInfo;
var barChart;
var showQuestionAfterSeconds = 4000;
var startTimerAfterSeconds = 3000;
var timerSound;

class AnswerUpdate {

    constructor(isAnsweredCorrectly, correctOptionIdx, amountWon) {
        this.isAnsweredCorrectly = isAnsweredCorrectly;
        this.correctOptionIdx = correctOptionIdx;
        this.amountWon = amountWon;
    }
}

class LifeLine {

    constructor(isUsed, name) {
        this.isUsed = isUsed;
        this.name = name;
    }
}

class LifeLinesInfo {

    // lifeLines - array of LifeLine objects
    constructor(lifelines, showLifeLines) {
        this.lifelines = lifelines;
        this.showLifeLines = showLifeLines;
    }
}


// questions
const options = ["Option A", "Option B", "Option C", "Option D"];
const questions = []

var socket = io.connect(url);
var isSocketConnected = false;

socket.on('connect', function() {
    isSocketConnected = true;
});

socket.on('audience_poll_data', function(audiencePollData) {
    console.log(audiencePollData);
    showAudiencePollData(audiencePollData);
});

socket.on('get_question_set', function(questions_set) {
    //console.log(questions_set);
    for(let i=0; i < questions_set.length; i++) {
        const question_set = questions_set[i];
        question = new Question(question_set.question, question_set.options,
            question_set.correctOptionIndexes,
            question_set.winAmount,
            question_set.amountWonForWrong,
            question_set.trivia,
            question_set.maxSeconds,
            question_set.isSafeLevel)
        //console.log(question);
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
    playStopTimerSound(false);
    timer = setInterval(() => {
        if(!isPaused) {
            if(currSeconds >= 0) {
                updateTimer(currSeconds);
                // sending the event to the server
                socket.emit("set_timer", currSeconds);
                currSeconds -= 1;
            } else {
                // timeout, send event
                window.clearTimeout(timer);
                playStopTimerSound(false);
            }
        }
    }, interval);
    playStopTimerSound(true);
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
        //loadNextQuestion();
        clearExistingQuestion();
        playBeforeQuestionSound();
        window.setTimeout(loadNextQuestion, showQuestionAfterSeconds);        
    });

    btnShowLifelines.addEventListener("click", (e) => {
        // send event
        lifeLinesInfo.showLifeLines = true;
        isLifeLinesBeingShowed = !isLifeLinesBeingShowed;
        socket.emit("set_lifelines", lifeLinesInfo);
        showImageLifeLinesInfo(lifeLinesInfo);
    });

    btnHideLifelines.addEventListener("click", (e) => {
        // send event
        lifeLinesInfo.showLifeLines = false;
        isLifeLinesBeingShowed = !isLifeLinesBeingShowed;
        showHideAudiencePollChart(false);
        socket.emit("set_lifelines", lifeLinesInfo);
        showImageLifeLinesInfo(lifeLinesInfo);
    });

    btnShowAudienceData.addEventListener("click", (e) => {
        // send event
        socket.emit("get_audience_poll_data");
    });

    btnActivate5050.addEventListener("click", (e) => {
        // send event
        btnActivate5050.disabled = true;
        activate5050();
    });

    lifeline1.addEventListener("click", (e) => {
        // send event
        lifeline1.disabled = true;
        lifeLinesInfo.lifelines[0].isUsed = true;
        lifeLinesInfo.showLifeLines = true;
        socket.emit("set_lifelines", lifeLinesInfo);
        showImageLifeLinesInfo(lifeLinesInfo);
    });

    lifeline2.addEventListener("click", (e) => {
        // send event
        // it's 50:50, remove 2 options
        lifeline2.disabled = true;
        lifeLinesInfo.lifelines[1].isUsed = true;
        lifeLinesInfo.showLifeLines = true;
        socket.emit("set_lifelines", lifeLinesInfo);
        //activate5050();
        showImageLifeLinesInfo(lifeLinesInfo);
    });

    lifeline3.addEventListener("click", (e) => {
        // send event
        lifeline3.disabled = true;
        lifeLinesInfo.lifelines[2].isUsed = true;
        lifeLinesInfo.showLifeLines = true;
        socket.emit("set_lifelines", lifeLinesInfo);
        showImageLifeLinesInfo(lifeLinesInfo);
    });

}

function pauseTimer() {
    isPaused = true;
    playStopTimerSound(false);
}

function resumeTimer() {
    isPaused = false;
    playStopTimerSound(true);
}

function updateTimer(time) {
    secondsEle.innerHTML = time;
}

function clearOptions() {

}

function playStopTimerSound(play) {
    if(play) {
        timerSound = new Audio('static/music/kbc_clock.mp3');
        timerSound.play();
    } else {
        if(timerSound != null) {
            timerSound.pause();    
        }
    }
}

function playOptionLockSound() {
    var tmpAudio = new Audio('static/music/option_lock.mp3');
    tmpAudio.play();
}

function playRightAnswerSound() {
    var tmpAudio = new Audio('static/music/right_answer.mp3');
    tmpAudio.play();
}

function playWrongAnswerSound() {
    var tmpAudio = new Audio('static/music/wrong_answer.mp3');
    tmpAudio.play();
}

function playBeforeQuestionSound() {
    var tmpAudio = new Audio('static/music/before_question.mp3');
    tmpAudio.play();
}

function revealAnswerToContestant() {
    revealAnswerButton.disabled = true;
    socket.emit("set_answer", answerUpdateObj);
    if(answerUpdateObj.isAnsweredCorrectly) {
        playRightAnswerSound();
    } else {
        playWrongAnswerSound();
    }
}

function showCorrectAnswerToHost(selectedOptionIdx) {
    const txtAnswerStat = document.getElementById("txt_answer_stat");
    const txtTrivia = document.getElementById("txt_trivia");
    showHideDivSection(divAnswer, true);

    const correctOptionIndexes = currQuestion.correctOptionIndexes;

    // showing answer trivia
    txtTrivia.innerHTML = currQuestion.trivia;
    answerUpdateObj = new AnswerUpdate(false, "", currQuestion.winAmount);

    if(correctOptionIndexes.length == 0) {
        currRightOptionIdx = "";
        txtAnswerStat.innerHTML = "Wrong Answer, won - Rs."+String(currQuestion.amountWonForWrong);
        answerUpdateObj.isAnsweredCorrectly = false;
        answerUpdateObj.amountWon = currQuestion.amountWonForWrong;
        applyWrongAnswerStyle(getOptionDivByIndex(selectedOptionIdx), selectedOptionIdx);
        return;
    }

    var isAnsweredCorrectly = false;
    for(let i=0; i<correctOptionIndexes.length; i++) {
        currRightOptionIdx = correctOptionIndexes[i];
        if(correctOptionIndexes[i] == selectedOptionIdx) {
            isAnsweredCorrectly = true;
            break;
        }
    }

    answerUpdateObj.correctOptionIdx = currRightOptionIdx;
    if(isAnsweredCorrectly) {
        txtAnswerStat.innerHTML = "Right Answer, won - Rs."+String(currQuestion.winAmount);
        answerUpdateObj.isAnsweredCorrectly = true;
        applyCorrectAnswerStyle(getOptionDivByIndex(selectedOptionIdx), selectedOptionIdx);
    } else {
        txtAnswerStat.innerHTML = "Wrong Answer, won - Rs."+String(currQuestion.amountWonForWrong);
        answerUpdateObj.isAnsweredCorrectly = false;
        answerUpdateObj.amountWon = currQuestion.amountWonForWrong;
        applyWrongAnswerStyle(getOptionDivByIndex(selectedOptionIdx), selectedOptionIdx);
        applyCorrectAnswerStyle(getOptionDivByIndex(currRightOptionIdx), currRightOptionIdx);
    }
}

function showAudiencePollData(audienceData) {
    showHideAudiencePollChart(true);
    //audienceData = [10,0,1,1];

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Option');
    data.addColumn('number', 'Percentage');
    data.addColumn({ role: 'style' }, 'style');
    data.addColumn({ role: 'annotation' }, 'annotation');

    /*data.addRows([
        ["A", 10, '10'],
        ["B", 10],
        ["C", 10],
        ["D", 10]
      ]);*/

    var totVotes = 0;
    for(let i=0; i<audienceData.length; i++) {
        totVotes += audienceData[i];
    }

    const optionNames = ['A', 'B', 'C', 'D'];

    for(let i=0; i<audienceData.length; i++) {
        var optionPerc = (audienceData[i]/totVotes)*100;
        optionPerc = Math.round(optionPerc);

        barStyle = 'stroke-color: #232366; stroke-opacity: 0.6; stroke-width: 2; fill-color: #273296;'
        const val = [optionNames[i], optionPerc, barStyle, String(optionPerc)+"%"];
        data.addRow(val);
    }
    

    var options = {'title':'Audience Poll',
                    vAxis: {
                        minValue: 0,
                        maxValue: 100
                      },
                    'width':400,
                    'height':300};

    // Instantiate and draw the chart.
    var chart = new google.visualization.ColumnChart(document.getElementById('div_audience_poll_chart'));
    chart.draw(data, options);
}

function showHideAudiencePollChart(show) {
    if(show) {
        showHideDivSection(divAudiencePollChart, show);
    } else {
        showHideDivSection(divAudiencePollChart, show);
    }
}

function showHideTableDiv(show) {
    if(show) {
        divQuestionTable.style.display = "block";
    } else {
        divQuestionTable.style.display = "none";
    }
}

function showHideDivSection(div, show) {
    if(show) {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}

function showHideLifelinesDivSection(show) {
    const trOption1 = document.getElementById("tr_option_row_1");
    const trOption2 = document.getElementById("tr_option_row_2");
    const trLifelines = document.getElementById("tr_lifelines");

    if(show) {
        trOption1.setAttribute("hidden", "hidden");
        trOption2.setAttribute("hidden", "hidden");
        trLifelines.removeAttribute("hidden");
    } else {
        trLifelines.setAttribute("hidden", "hidden");
        trOption1.removeAttribute("hidden");
        trOption2.removeAttribute("hidden");
    }
}

function getOptionDivByIndex(optionIdx) {
    var selectedDiv = "";
    if(optionIdx == 0) {
        selectedDiv = divOptionABack;
    } else if(optionIdx == 1) {
        selectedDiv = divOptionBBack;
    } else if(optionIdx == 2) {
        selectedDiv = divOptionCBack;
    } else if(optionIdx == 3) {
        selectedDiv = divOptionDBack;
    }
    return selectedDiv;
}

function getOptionTextDivByIndex(optionIdx) {
    var selectedEle = "";
    if(optionIdx == 0) {
        selectedEle = divOptionAText;
    } else if(optionIdx == 1) {
        selectedEle = divOptionBText;
    } else if(optionIdx == 2) {
        selectedEle = divOptionCText;
    } else if(optionIdx == 3) {
        selectedEle = divOptionDText;
    }
    return selectedEle;
}

function optionListener(button, selectedOptionIdx) {
    button.onclick = function() {
        if(isLockedCurrQuestion) {
            return;
        }
        isLockedCurrQuestion = true;
        pauseTimer();
        //button.disabled = true;
        playOptionLockSound();
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

function clearExistingQuestion() {
    divOptionABack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionBBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionCBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionDBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';

    divQuestionText.innerHTML = "";

    divOptionAText.style.color = "white";
    divOptionBText.style.color = "white";
    divOptionCText.style.color = "white";
    divOptionDText.style.color = "white";

    divOptionAText.innerHTML = "";
    divOptionBText.innerHTML = "";
    divOptionCText.innerHTML = "";
    divOptionDText.innerHTML = "";

    // hiding answer text and reveal button
    const txtAnswerStat = document.getElementById("txt_answer_stat");
    txtAnswerStat.innerHTML = "";
    revealAnswerButton.disabled = true;

    updateTimer("");
    showHideDivSection(divAnswer, false);
}

function showQuestion(question) {
    currQuestion = question;
    isLockedCurrQuestion = false;

    divOptionABack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionBBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionCBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionDBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';

    divQuestionText.innerHTML = question.question;

    divOptionAText.style.color = "white";
    divOptionBText.style.color = "white";
    divOptionCText.style.color = "white";
    divOptionDText.style.color = "white";

    divOptionAText.innerHTML = "A. " + question.options[0];
    divOptionBText.innerHTML = "B. " + question.options[1];
    divOptionCText.innerHTML = "C. " + question.options[2];
    divOptionDText.innerHTML = "D. " + question.options[3];

    // hiding answer text and reveal button
    const txtAnswerStat = document.getElementById("txt_answer_stat");
    txtAnswerStat.innerHTML = "";
    revealAnswerButton.disabled = true;

    optionListener(divOptionABack, 0);
    optionListener(divOptionBBack, 1);
    optionListener(divOptionCBack, 2);
    optionListener(divOptionDBack, 3);
}

function showImageLifeLinesInfo(lifelinesObj) {
    if(!lifelinesObj.showLifeLines) {
        //showHideDivSection(divLifelines, false);
        showHideLifelinesDivSection(false);
        return;
    }

    //showHideDivSection(divLifelines, true);
    showHideLifelinesDivSection(true);
    const lineHideOpacity = 0.3;
    if(lifelinesObj.lifelines[0].isUsed) {
        //imgLifeline1.style.opacity = lineHideOpacity;
        imgLifeline1.src = "static/images/audience_poll_used.png"
    }
    if(lifelinesObj.lifelines[1].isUsed) {
        // it's 50:50, remove 2 options
        //imgLifeline2.style.opacity = lineHideOpacity;
        imgLifeline2.src = "static/images/lifeline_5050_used.png"
    }
    if(lifelinesObj.lifelines[2].isUsed) {
        //imgLifeline3.style.opacity = lineHideOpacity;
        imgLifeline3.src = "static/images/lifeline_call_used.png"
    }
}

function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
}

function activate5050() {
    const correctOptionIndexes = currQuestion.correctOptionIndexes;
    var correctOptionIdx = "";
    if(correctOptionIndexes.length == 0) {
        correctOptionIdx = 0;
    } else {
        correctOptionIdx = correctOptionIndexes[0];
    }

    //const correctOptionIdx = currQuestion.correctOptionIdx;
    var tmpOptions = [0, 1, 2, 3];
    tmpOptions.splice(correctOptionIdx, 1);

    var removedIndexes = [];
    const index1 = Math.floor(Math.random()*tmpOptions.length);
    removedIndexes.push(tmpOptions[index1]);
    tmpOptions.splice(index1, 1);

    const index2 = Math.floor(Math.random()*tmpOptions.length);
    removedIndexes.push(tmpOptions[index2]);
    console.log(removedIndexes);
    // send it to client
    socket.emit("set_5050", removedIndexes);
    // remove for host
    for(let i=0; i<removedIndexes.length; i++) {
        let indexToRemove = removedIndexes[i];
        getOptionTextDivByIndex(indexToRemove).innerHTML = "";
    }

    // updating the new correct option indexes as one of the option might removed from 5050
    var newCorrectOptionIndexes = [];
    for(let j=0; j<currQuestion.correctOptionIndexes.length; j++) {
        var isIndexRemoved = false;
        var correctOptionIdx = currQuestion.correctOptionIndexes[j];
        for(let i=0; i<removedIndexes.length; i++) {
            let indexRemoved = removedIndexes[i];
            if(indexRemoved == correctOptionIdx) {
                isIndexRemoved = true;
                break;
            }
        }

        if(!isIndexRemoved) {
            newCorrectOptionIndexes.push(correctOptionIdx);
        }
    }
    //console.log(newCorrectOptionIndexes);
    currQuestion.correctOptionIndexes = newCorrectOptionIndexes;
}

function addQuestionsToTable() {
    for(let i=questions.length-1; i >= 0; i--) {
        let question = questions[i];
        var row = tableQuestionsList.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        // question number
        cell1.innerHTML = i+1;
        // amount
        cell2.innerHTML = "Rs. " +question.winAmount;
        // time
        cell3.innerHTML = question.maxSeconds;
        // safe level
        cell4.innerHTML = question.isSafeLevel;
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
        alert("all questions read");
        return;
    }
    currQuestion = questions[lastViewedQuestionIdx];
    showQuestion(currQuestion);
    socket.emit("set_question", currQuestion);

    // marking time empty initially
    if(currQuestion.maxSeconds == 0) {
        updateTimer("");
    } else {
        updateTimer(currQuestion.maxSeconds);
        // sending max time before the countdown begining
        socket.emit("set_timer", currQuestion.maxSeconds);
    }
    

    // modifying table
    const currQuestionTableIdx = questions.length - lastViewedQuestionIdx;
    tableQuestionsList.rows[currQuestionTableIdx].cells[0].innerHTML = '<del>'+String(lastViewedQuestionIdx+1)+"</dev>";
    const price = tableQuestionsList.rows[currQuestionTableIdx].cells[1].innerHTML;
    tableQuestionsList.rows[currQuestionTableIdx].cells[1].innerHTML = '<del>'+String(price)+"</dev>";
    hideShowNextQuestionOption(false);

    //startTimer(currQuestion.maxSeconds);
    window.setTimeout(startTimer, startTimerAfterSeconds, currQuestion.maxSeconds);
}

function applyLockedAnswerStyle(optionDiv, optionIndex) {
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_locked.svg)';
    getOptionTextDivByIndex(optionIndex).style.color = "black";
}

function applyCorrectAnswerStyle(optionDiv, optionIndex) {
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_correct.svg)';
    getOptionTextDivByIndex(optionIndex).style.color = "black";
}

function applyWrongAnswerStyle(optionDiv, optionIndex) {
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_wrong.svg)';
    getOptionTextDivByIndex(optionIndex).style.color = "black";
}

function readElements() {
    divQuestionTable = document.getElementById("div_table");
    btnNextQuestion = document.getElementById("btn_next_question");

    // question
    divQuestionBack = document.getElementById("div_question_back");
    divQuestionText = document.getElementById("div_question_text");

    // options
    divOptionABack = document.getElementById("div_option_a_back");
    divOptionBBack = document.getElementById("div_option_b_back");
    divOptionCBack = document.getElementById("div_option_c_back");
    divOptionDBack = document.getElementById("div_option_d_back");

    divOptionAText = document.getElementById("div_option_a_text");
    divOptionBText = document.getElementById("div_option_b_text");
    divOptionCText = document.getElementById("div_option_c_text");
    divOptionDText = document.getElementById("div_option_d_text");

    // answer
    divAnswer = document.getElementById("div_answer");
    spTimer = document.getElementById("sp_timer");
    tableQuestionsList = document.getElementById("table_questions_list");

    // lifelines
    btnShowLifelines = document.getElementById("btn_show_lifelines");
    btnHideLifelines = document.getElementById("btn_hide_lifelines");
    btnShowAudienceData = document.getElementById("btn_show_audience_data");
    btnActivate5050 = document.getElementById("btn_activate_5050");
    lifeline1 = document.getElementById("lifeline_1");
    lifeline2 = document.getElementById("lifeline_2");
    lifeline3 = document.getElementById("lifeline_3");

    // lifelines images
    divLifelines = document.getElementById("div_lifelines");
    imgLifeline1 = document.getElementById("img_line1");
    imgLifeline2 = document.getElementById("img_line2");
    imgLifeline3 = document.getElementById("img_line3");

    divAudiencePoll = document.getElementById("div_audience_poll");
    divAudiencePollChart = document.getElementById("div_audience_poll_chart");
    timerSound = new Audio('static/music/kbc_clock.mp3');
}

function loadLifeLines() {
    var line1 = new LifeLine(false, "Audience Poll");
    var line2 = new LifeLine(false, "50:50");
    var line3 = new LifeLine(false, "Dial A Dost");

    const lines = [line1, line2, line3];
    lifeLinesInfo = new LifeLinesInfo(lines, false);

    lifeline1.innerHTML = line1.name;
    lifeline2.innerHTML = line2.name;
    lifeline3.innerHTML = line3.name;
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
    showHideLifelinesDivSection(false);
    addEventListeners();
    read_file_name_and_load();
    loadLifeLines();
    google.charts.load('current', {packages: ['corechart', 'bar']});
    //google.charts.setOnLoadCallback(showAudiencePollData);
    showHideDivSection(divAnswer, false);
});