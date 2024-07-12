// Listeners
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/webgazer.js');
script.type = 'text/javascript';
script.id = 'webgazer';
document.body.appendChild(script);
script.onload = function() {
    webgazer.showPredictionPoints(false);
    webgazer.showVideo(false);
	webgazer.applyKalmanFilter(true);
	webgazer.removeMouseEventListeners();
	webgazer.setGazeListener((data) => {
		if (data == null) {
			return;
		}
		sendCoordinates(data.x, data.y);
	}).begin();
	
};

async function getPrediction() {
	var prediction = await webgazer.getCurrentPrediction();
	sendCoordinates(prediction.x, prediction.y);
}

async function sendCoordinates(x, y) {
	getPrediction();
	chrome.runtime.sendMessage({ type: 'scroll', coordinates: { x, y } }, (response) => {
	});
}