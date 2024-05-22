
const webCam = document.getElementById("webcam");
let isStreamActive = false;

document.getElementById("toggleWebcam").addEventListener("click", () => {
	if (isStreamActive) {
		stopWebcam();
	} else {
		startWebcam();
	}
});

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
		
		webCam.srcObject = stream;
		webCam.play();
		isStreamActive = true;

		// Capture image frames
		captureFrames(stream);
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

function stopWebcam() {
	stream = webCam.srcObject;
    stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.stop();
        }
    });
	webCam.srcObject = null;
	isStreamActive = false;
}

function captureFrames(stream) {
	const mediaStreamTrack = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(mediaStreamTrack);
    // imageCapture.grabFrame()
    //     .then(imageBitmap => {
    //         webCam.width = imageBitmap.width;
    //         webCam.height = imageBitmap.height;
    //         webCam.getContext('2d').drawImage(imageBitmap, 0, 0);
    //     })
    //     .catch(error => console.error('grabFrame() error:', error));
    //     webCam.play()
    //     console.log(imageCapture);
}