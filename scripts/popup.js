document.getElementById('toggleWebcam').addEventListener('click', () => {
    // Request the "activeTab" permission
    // chrome.permissions.request({
    //   permissions: ['activeTab', 'videoCapture']
    // }, (granted) => {
    //   if (granted) {
    //     console.log('Permission granted.');
    //     startWebcam();
    //   } else {
    //     console.log('Permission denied.');
    //   }
    // });
    startWebcam();
  });
  
  function startWebcam() {
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then(stream => {
        const videoElement = document.getElementById('webcam');
        videoElement.srcObject = stream;
        videoElement.play();
      })
      .catch(err => {
        console.error('getUserMedia() error:', err);
        let errorMessage = 'An error occurred: ';
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage += 'Permission to access camera was denied.';
          break;
        case 'NotFoundError':
          errorMessage += 'No camera device found.';
          break;
        case 'NotReadableError':
          errorMessage += 'Camera is already in use by another application.';
          break;
        default:
          errorMessage += err.message;
      }
      document.getElementById('error').textContent = errorMessage;
      });
  }
  