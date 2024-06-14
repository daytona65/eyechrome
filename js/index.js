
const webCam = document.getElementById("webcam");
let canvas = document.querySelector("canvas");
let isStreamActive;

getState().then((response) => {
	isStreamActive = response.isStreamActive;
	if (isStreamActive) {
		console.log("Fresh start")
		startWebcam();
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
			stopWebcam();
			document.querySelector('#toggleWebcam').innerHTML =
			  'Enable Webcam';
			document.querySelector('#toggleWebcam').style.border = 
			'5px solid green';
	
		} else {
			startWebcam();
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

// WebGazer
const script = document.createElement('script');
script.src = chrome.runtime.getURL('webgazer.js');
script.onload = function() {
	script.remove();

	// Start WebGazer
	webgazer.setRegression('ridge')
			.setGazeListener((data, elapsedTime) => {
				if (data == null) {
				return;
				}
				const xPrediction = data.x;
				const yPrediction = data.y;
				console.log(`x: ${xPrediction}, y: ${yPrediction}`);
			}).begin();
};

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