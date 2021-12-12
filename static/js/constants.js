
//var base_url = 'http://192.168.1.49:5000';
var base_url = 'http://192.168.0.108:5000';
var BASE_URL = 'http://192.168.0.108:5000';

var AUDIENCE_ENDPOINT = "/spectator";
var CONTESTANT_ENDPOINT = "/contestant";
var HOST_START_ENDPOINT = "/home_start";
var URL_QRU_ENDPOINT = "/url_qr";

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
