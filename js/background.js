// Install
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
    // open options
    chrome.tabs.create({
        url: '../html/permission.html'
    })
});

// Tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete') {
        chrome.scripting.executeScript({
            files:['js/content-script.js'],
            target: {tabId: tabId}
        });
    }
});
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["js/content-script.js"]
    });
});

// Index.js to content-script.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'scroll') {
      // Get the active tab and send the message to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'scroll',
            coordinates: message.coordinates
          });
        }
      });
    }
  });


// WebGazer


// Webcam toggle
let state = {
    isStreamActive: false
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_STATE') {
        sendResponse({ response: state });
    } else if (request.type === 'SET_STATE') {
        state = { ...state, ...request.state };
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