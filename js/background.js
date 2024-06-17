// Install and obtain webcam permissions
console.log("Background is running!");
chrome.runtime.onInstalled.addListener(({reason}) => {
    console.log(reason)
    if (reason === 'install') {
        chrome.tabs.create({
            url: '../html/permission.html'
        })
        .catch((err) => {
            console.error("Permissions error:", err);
            console.error(err.name);
        });
    }
});
chrome.runtime.onStartup.addListener( () => {
    console.log(`Background is running!`);
});

// Activate content-script on tab change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
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

// Send gaze predictions from background to content-script
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

// Offscreen document and Webgazer
chrome.offscreen.createDocument({
    url: '/background.html',
    reasons: ['USER_MEDIA', 'DOM_PARSER'],
    justification: 'To run Webgazer to get gaze coordinates',
});

let state = {
    isStreamActive: false
}

async function startWebgazer() {
    // await setupOffscreenDocument('background.html');
    console.log("creating script in background")
    const script = document.createElement('script');
    script.id = 'webgazer';
    script.src = chrome.runtime.getURL('js/webgazer.js');
    script.type = 'text/javascript';
    document.body.appendChild(script);
    script.onload = function() {
	console.log("Webgazer in background");
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
    // await setupOffscreenDocument('background.html');
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

// State management
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_STATE') {
        sendResponse({ response: state });
    } else if (request.type === 'SET_STATE') {
        state = { ...state, ...request.state };
        sendResponse({ response: state });
        if (state.isStreamActive) {
            startWebgazer();
        } else {
            stopWebgazer();
        }
    }
    return true;
});
  
function setState(isActive) {
    state.isStreamActive = isActive;
    console.log(`Stream state updated: ${isActive}`);
}


// Start webcam test
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
}