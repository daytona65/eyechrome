// Listeners
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/webgazer.js');
script.type = 'text/javascript';
script.id = 'webgazer';
document.body.appendChild(script);
script.onload = function() {
    webgazer.showPredictionPoints(false);
    webgazer.showVideo(false);
	webgazer.setRegression("ridge");
	gazeListener();
};

function gazeListener() {
	webgazer.setGazeListener(function (data) {
		if (data == null) {
			console.error("Webgazer data null")
			return;
		}
		sendCoordinates(data.x, data.y);
	}).begin();
}
function sendCoordinates(x, y) {
	gazeListener();
	chrome.runtime.sendMessage({ type: 'scroll', coordinates: { x, y } }, (response) => {
		if (!response) {
			reject(chrome.runtime.lastError);
		} else {
			resolve(response.response)
		}
	});
}