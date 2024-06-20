
// Listeners
console.log("Offscreen is running!");
console.log("Starting Webgazer")
const script = document.createElement('script');
script.id = 'webgazer';
script.src = chrome.runtime.getURL('js/webgazer.js');
script.type = 'text/javascript';
document.body.appendChild(script);
script.onload = function() {
    console.log("Webgazer in offscreen!");
    webgazer.showPredictionPoints(false);
    webgazer.showVideo(false);
    webgazer
        .setGazeListener(function (data) {
            if (data == null) {
                console.log("Webgazer data null")
                return;
            }
            sendCoordinates(data.x, data.y);
        })
        .begin();
};

function sendCoordinates(x, y) {
	console.log("Offscren sending", x, y);
	let xNorm = (x + 90) / 500;
	let yNorm = (y - 300) / 100;
	console.log(xNorm, yNorm);
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type: 'scroll', coordinates: { xNorm, yNorm } }, (response) => {
			if (!response) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(response.response)
			}
		});
	});
}