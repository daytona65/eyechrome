// Listeners
console.log("Offscreen is running!");
console.log("Starting Webgazer")
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/webgazer.js');
script.type = 'text/javascript';
document.body.appendChild(script);
script.onload = function() {
    console.log("Webgazer in offscreen!");
    webgazer.showPredictionPoints(false);
    webgazer.showVideo(false);
	webgazer.setRegression("ridge");
	gazeListener();
};

function gazeListener() {
	webgazer.setGazeListener(function (data) {
		if (data == null) {
			console.log("Webgazer data null")
			return;
		}
		sendCoordinates(data.x, data.y);
	}).begin();
}
function sendCoordinates(x, y) {
	console.log("Offscreen sending", x, y);
	gazeListener();
	chrome.runtime.sendMessage({ type: 'scroll', coordinates: { x, y } }, (response) => {
		if (!response) {
			reject(chrome.runtime.lastError);
		} else {
			resolve(response.response)
		}
	});
}