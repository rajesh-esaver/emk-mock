

function generateQRCode() {
    let serverUrl = document.getElementById("inp_url").value;
    if (serverUrl) {
        let newBaseUrl = getBaseUrlPart(serverUrl);

        let divAudienceQr = document.getElementById("div_audience_qr");
        let audienceQrUrl = getAudienceUrl(newBaseUrl);
        divAudienceQr.innerHTML = "";
        new QRCode(divAudienceQr, audienceQrUrl);
        document.getElementById("p_audience_qr").innerHTML = audienceQrUrl;

        let divContestantQr = document.getElementById("div_contestant_qr");
        let contestantQrUrl = getContestantUrl(newBaseUrl);
        divContestantQr.innerHTML = "";
        new QRCode(divContestantQr, contestantQrUrl);
        document.getElementById("p_contestant_qr").innerHTML = contestantQrUrl;

    }
}

function getBaseUrlPart(newUrl) {
    var newBaseUrl = newUrl;
    if(newUrl.endsWith("/")) {
        newBaseUrl = newUrl.slice(0, -1);
    }
    return newBaseUrl;
}

function getAudienceUrl(serverUrl) {
    return serverUrl + AUDIENCE_ENDPOINT;
}

function getContestantUrl(serverUrl) {
    return serverUrl + CONTESTANT_ENDPOINT;
}

$(document).ready(function() {
    document.getElementById("inp_url").value = BASE_URL;
});