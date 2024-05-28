chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
});

// Called when the user clicks on the browser action(tab)
// chrome.browserAction.onClicked.addListener(function(tab) {
//     alert("test");
// });

let canvas = new OffscreenCanvas(300, 200);
Promise.all([
    faceapi
])
