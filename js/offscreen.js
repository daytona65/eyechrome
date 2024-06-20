
// Listeners
console.log("Offscreen is running!");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'startWebgazer') {
      startWebgazer();
    } else if (message.type === 'stopWebgazer' ) {
      stopWebgazer();
    }
    return true;
});

async function startWebgazer() {
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
                    return;
                }
                sendCoordinates(data.x, data.y);
            })
            .begin();
    };
}

async function stopWebgazer() {
    console.log("Stopping Webgazer")
    const script = document.getElementById('webgazer')
    script.remove();
}

function sendCoordinates(x, y) {
	console.log("sending");
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