const webCam = document.getElementById("webcam");
let canvas = document.querySelector("canvas");
let isStreamActive;
// Webgazer
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/webgazer.js');
script.type = 'text/javascript'
// document.body.appendChild(script);

script.onload = function() {
	console.log("Webgazer in index");
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
  

getState().then((response) => {
	isStreamActive = response.isStreamActive;
	if (isStreamActive) {
		document.querySelector('#toggleWebcam').innerHTML =
		  'Disable Webcam';
		document.querySelector('#toggleWebcam').style.border = 
		'5px solid red';
	}
}).catch(error => {
	console.error('Error in getting state', error);
});



document.querySelector("#toggleWebcam").addEventListener("click", () => {
	getState().then(response => {
		isStreamActive = response.isStreamActive
		if (isStreamActive) {
			setState({ isStreamActive: false });
			// stopWebcam();
			document.querySelector('#toggleWebcam').innerHTML =
			  'Enable Webcam';
			document.querySelector('#toggleWebcam').style.border = 
			'5px solid green';
	
		} else {
			setState({ isStreamActive: true });
			// startWebcam();
			document.querySelector('#toggleWebcam').innerHTML =
			  'Disable Webcam';
			document.querySelector('#toggleWebcam').style.border = 
			'5px solid red';
		}
	}).catch(error => {
		console.error('Error in getting state', error);
	});
});

function getState() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
			if (!response) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(response.response)
			}
		});
	});
}

function setState(newState) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type: 'SET_STATE', state: newState }, (response) => {
			if (!response) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(response.response)
			}
		});
	});
}