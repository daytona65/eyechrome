// Context of background eye tracking, eye tracking and webcam logic here
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
    // open options
    chrome.tabs.create({
        url: '../html/permission.html'
    })
});

console.log("background is running!");

let state = {
    isStreamActive: false
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('message received in background.js: ', request);
    if (request.type === 'GET_STATE') {
        sendResponse({ response: "hello" });
    } else if (message.type === 'SET_STATE') {
        state = { ...state, ...message.state };
        sendResponse({ response: "received" });
    }
});
  
function updateStreamState(isActive) {
    state.isStreamActive = isActive;
    console.log(`Stream state updated: ${isActive}`);
}

