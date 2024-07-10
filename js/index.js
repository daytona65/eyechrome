let isStreamActive;
let isWebgazerActive;
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// Webgazer
getState().then(async (response) => {
	isStreamActive = response.isStreamActive;
	isWebgazerActive = response.isWebgazerActive;
	if (!isWebgazerActive) {
		const script = document.createElement('script');
		script.src = chrome.runtime.getURL('js/webgazer.js');
		script.type = 'text/javascript';
		script.id = 'tempWebgazer';
		document.body.appendChild(script);
		script.onload = function() {
			webgazer.showPredictionPoints(false);
			webgazer.showVideo(false);
			webgazer.setRegression("ridge");
			webgazer.setGazeListener(function (data) {
				enableLoadingButton();
			}).begin();
		};
		await loadingButton();
	} else if (isStreamActive) {
		document.querySelector('#toggleWebcam').innerHTML =
		'Disable';
		document.querySelector('#toggleWebcam').style.border = 
		'5px solid red';
	}
}).catch(error => {
	console.error('Error in getting state', error);
});

document.querySelector("#toggleWebcam").addEventListener("click", () => {
	if (!isWebgazerActive) { // cannot use location.reload()
		setState({ isStreamActive: false, isWebgazerActive: true });
		isWebgazerActive = true;
		document.getElementById('tempWebgazer').remove()
		stopAllVideoStreams();
		document.querySelector('#toggleWebcam').innerHTML =
		'Enable';
		document.querySelector('#toggleWebcam').style.border = 
		'5px solid green';
	} else {
		getState().then(response => {
			isStreamActive = response.isStreamActive
			if (isStreamActive) {
				setState({ isStreamActive: false });
				document.querySelector('#toggleWebcam').innerHTML =
				'Enable';
				document.querySelector('#toggleWebcam').style.border = 
				'5px solid green';
		
			} else {
				setState({ isStreamActive: true });
				document.querySelector('#toggleWebcam').innerHTML =
				'Disable';
				document.querySelector('#toggleWebcam').style.border = 
				'5px solid red';
			}
		}).catch(error => {
			console.error('Error in getting state', error);
		});
	}
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

async function loadingButton() {
	document.querySelector("#toggleWebcam").disabled = true;
	document.querySelector('#toggleWebcam').style.border = 
	'5px solid black';
	document.querySelector('#toggleWebcam').innerHTML =
	'Loading...';
}

function enableLoadingButton() {
	document.querySelector('#toggleWebcam').style.border = 
	'5px solid green';
	document.querySelector("#toggleWebcam").disabled = false;
	document.querySelector('#toggleWebcam').innerHTML =
	'Click to Load Model';
}

function stopAllVideoStreams() {
	const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
        const mediaStream = video.srcObject;
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => {
                track.stop(); // Stop each track in the MediaStream
            });
            video.srcObject = null; // Clear the srcObject to stop playback
        }
    });
}