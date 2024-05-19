// Grab elements, create settings, etc.
var video = document.getElementById('video');

// Get access to the camera!
// if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     // Not adding `{ audio: true }` since we only want video now
//     navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
//         video.src = window.URL.createObjectURL(stream);
//         video.srcObject = stream;
//         video.play();
//     });
// }

navigator.mediaDevices.getUserMedia({video: true})
    .then(gotMedia)
    .catch(error => console.error('getUserMedia() error:', error)); //Permission must be granted first



function gotMedia(mediaStream) {
    const mediaStreamTrack = mediaStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(mediaStreamTrack);
    imageCapture.grabFrame()
        .then(imageBitmap => {
            video.width = imageBitmap.width;
            video.height = imageBitmap.height;
            video.getContext('2d').drawImage(imageBitmap, 0, 0);
        })
        .catch(error => console.error('grabFrame() error:', error));
        video.play()
        console.log(imageCapture);
}