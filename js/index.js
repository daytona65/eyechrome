let isStreamActive;
// Webgazer
getState().then((response) => {
	isStreamActive = response.isStreamActive;
	if (isStreamActive) {
		document.querySelector('#toggleWebcam').innerHTML =
		  'Disable';
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