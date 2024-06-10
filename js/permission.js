navigator.mediaDevices.getUserMedia({
    video: true
  }).then(stream => {
    document.querySelector('#message').innerHTML =
      'Webcam access granted, you may close this tab';
    chrome.storage.local.set({
      'camAccess': true
    }, () => {});
  })
  .catch(err => {
    document.querySelector('#message').innerHTML =
      'Error getting webcam access: ' + err.toString();
    console.error(err);
  });