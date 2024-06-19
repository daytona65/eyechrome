const webCam = document.getElementById("webcam");
let canvas = document.querySelector("canvas");
let isStreamActive;
// Webgazer
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/webgazer.js');
script.type = 'text/javascript'
document.body.appendChild(script);

script.onload = function() {
	console.log("WEBGAZER LOADED");
	webgazer.showPredictionPoints(true);
	webgazer.showVideo(true);
	webgazer.setRegression("ridge");
	webgazer
	  .setGazeListener(function (data) {
		if (data == null) {
		  return;
		}
		sendCoordinates(data.x, data.y);
	  })
	  .begin();
};
  

// getState().then((response) => {
// 	isStreamActive = response.isStreamActive;
// 	if (isStreamActive) {
// 		console.log("Fresh start")
// 		startWebcam();
// 		document.querySelector('#toggleWebcam').innerHTML =
// 		  'Disable Webcam';
// 		document.querySelector('#toggleWebcam').style.border = 
// 		'5px solid red';
// 	}
// }).catch(error => {
// 	console.error('Error in getting state', error);
// });



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

function sendCoordinates(x, y) {
	console.log("sending");
	let xNorm = (x + 90) / 500;
	let yNorm = (y - 200) / 50;
	console.log(x, y);
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

function startWebcam() {
	console.log("Starting Webcam")
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
		webCam.srcObject = stream;
		setState({ isStreamActive: true });
		// Capture image frames and perform live-manipulation
		const mediaStreamTrack = stream.getVideoTracks()[0];
    	let imageCapture = new ImageCapture(mediaStreamTrack);
		captureFrames(imageCapture);
    })
    .catch((err) => {
		console.error("getUserMedia() error:", err);
		let errorMessage = "An error occurred: ";
		switch (err.name) {
		case "NotAllowedError":
			errorMessage += "Permission to access camera was denied.";
			break;
		case "NotFoundError":
			errorMessage += "No camera device found.";
			break;
		case "NotReadableError":
			errorMessage += "Camera is already in use by another application.";
			break;
		default:
			errorMessage += err.message;
		}
		document.getElementById("error").textContent = errorMessage;
	});
}

// TODO: getTracks does not exist in null (stream)
function stopWebcam() {
	console.log("Stopping Webcam")
	stream = webCam.srcObject;
    stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.stop();
        }
    });
	webCam.srcObject = null;
	setState({ isStreamActive: false });
}

// Framecapture
function captureFrames(imageCapture) {
	const frameGrabber = async () => {
		imageCapture
		.grabFrame()
        .then(imageBitmap => {
			console.log("Grabbed frame!: ", imageBitmap);
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            canvas.getContext('2d').drawImage(imageBitmap, 0, 0);
			canvas.classList.remove("hidden"); //unhides the canvas
        })
        .catch(error => console.error('grabFrame() error:', error));
	}
}