

function generateQRCode() {
    let serverUrl = document.getElementById("inpUrl").value;
    if (serverUrl) {
        let divAudienceQr = document.getElementById("div_audience_qr");
        let audienceQrUrl = getAudienceUrl(serverUrl);
        divAudienceQr.innerHTML = "";
        new QRCode(divAudienceQr, audienceQrUrl);
        document.getElementById("p_audience_qr").innerHTML = audienceQrUrl;

        let divContestantQr = document.getElementById("div_contestant_qr");
        let contestantQrUrl = getContestantUrl(serverUrl);
        divContestantQr.innerHTML = "";
        new QRCode(divContestantQr, contestantQrUrl);
        document.getElementById("p_contestant_qr").innerHTML = contestantQrUrl;

    }
}

function getAudienceUrl(serverUrl) {
    if(serverUrl.endsWith("/")) {
        BASE_URL = serverUrl.slice(0, -1);
    } else {
        //BASE_URL = serverUrl + "/";
    }
    return BASE_URL + AUDIENCE_ENDPOINT;
}

function getContestantUrl(serverUrl) {
    if(serverUrl.endsWith("/")) {
        BASE_URL = serverUrl.slice(0, -1);
    } else {
        //BASE_URL = serverUrl + "/";
    }
    return BASE_URL + CONTESTANT_ENDPOINT;
}