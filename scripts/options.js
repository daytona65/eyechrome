let button = document.getElementById('requestPermission');

button.onclick = ()=>{
    if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 1280, height: 720 } },
        (stream) => {
            console.log('success');
        },
        (err) => {
            console.error(`The following error occurred: ${err.name}`);
        }
    );
    } else {
        console.log("getUserMedia not supported");
    }
};