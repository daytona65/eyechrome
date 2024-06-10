
const webCam = document.getElementById("webcam");
let canvas = document.querySelector("canvas");
let isStreamActive = false;

document.querySelector("#toggleWebcam").addEventListener("click", () => {
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
});

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
		webCam.srcObject = stream;
		isStreamActive = true;
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