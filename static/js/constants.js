
var BASE_URL = 'http://192.168.0.108:5000';
//var BASE_URL = 'http://192.168.1.9:5000';
//var BASE_URL = 'http://localhost:5000';

var AUDIENCE_ENDPOINT = "/spectator";
var CONTESTANT_ENDPOINT = "/contestant";
var HOST_START_ENDPOINT = "/home_start";
var URL_QRU_ENDPOINT = "/url_qr";

class Question {
    // correctOptionIdx 0,1,2,3
    constructor(question, options, correctOptionIndexes, winAmount, amountWonForWrong, trivia, maxSeconds, isSafeLevel) {
        this.question = question;
        this.options = options;
        this.correctOptionIndexes = correctOptionIndexes;
        this.winAmount = winAmount;
        this.amountWonForWrong = amountWonForWrong;
        this.trivia = trivia;
        this.maxSeconds = maxSeconds;
        this.isSafeLevel = isSafeLevel;
    }
}

function getServerBaseUrl() {
    /*let tmpBaseUrl = localStorage.getItem("base_url");
    if(tmpBaseUrl == null) {
        saveServerBaseUrl(base_url);
        return base_url;
    }*/
    return BASE_URL;
}

function saveServerBaseUrl(serverUrl) {
    BASE_URL = serverUrl;
    localStorage.setItem("base_url", serverUrl);
}
