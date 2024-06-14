// Context of background eye tracking, eye tracking and webcam logic here
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
    // open options
    chrome.tabs.create({
        url: '../html/permission.html'
    })
});
console.log("background is running!");

// WebGazer 
let state = {
    isStreamActive: false
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_STATE') {
        sendResponse({ response: state });
    } else if (request.type === 'SET_STATE') {
        state = { ...state, ...request.state };
        // if (state.isStreamActive == true) {
        //     startWebcam();
        // } else {
        //     stopWebcam();
        // }
        sendResponse({ response: state });
    }
    return true;
});
  
function setState(isActive) {
    state.isStreamActive = isActive;
    console.log(`Stream state updated: ${isActive}`);
}

async function startWebcam() {
    console.log("background startWebcam");
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
		// webCam.srcObject = stream;
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


async function stopWebcam() {
    console.log("background stopWebcam");
	// stream = webCam.srcObject;
    // stream.getTracks().forEach((track) => {
    //     if (track.readyState == 'live' && track.kind === 'video') {
    //         track.stop();
    //     }
    // });
	// webCam.srcObject = null;
}

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