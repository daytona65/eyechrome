// Install and obtain webcam permissions
console.log(`Background is running!`);
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

// Activate content-script on tab change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            files:['js/content-script.js'],
            target: {tabId: tabId}
        });
    }
});

// Send gaze predictions from offscreen to content-script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'scroll') {
        console.log("scroll received from offscreen");
      // Get the active tab and send the message to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'scroll',
            coordinates: message.coordinates
          }, (response) => {
            sendResponse(response);
          });
        }
      });
    }
    return true;
});

// Offscreen document and Webgazer
const OFFSCREEN_DOCUMENT_PATH = 'html/offscreen.html';
async function setupOffscreenDocument() {
    try {
        await chrome.offscreen.createDocument({
            url: OFFSCREEN_DOCUMENT_PATH,
            reasons: ['USER_MEDIA', 'DOM_PARSER'],
            justification: 'To run Webgazer to get gaze coordinates',
        });
    } catch (error) {
        if (!error.message.startsWith('Only a single offscreen'))
          throw error;
    }
    console.log("Has offscreen been created?", await hasDocument());
}

async function hasDocument() {
    // Check all windows controlled by the service worker if one of them is the offscreen document
    const matchedClients = await clients.matchAll();
    for (const client of matchedClients) {
      if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
        return true;
      }
    }
    return false;
}

async function startOffscreenWebgazer() {
    await setupOffscreenDocument();
}

async function stopOffscreenWebgazer() {
    await chrome.offscreen.closeDocument();
    console.log("stopOffscreenWebgazer");
}

// State management
let state = {
    isStreamActive: false
}
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'GET_STATE') {
        sendResponse({ response: state });
    } else if (request.type === 'SET_STATE') {
        state = { ...state, ...request.state };
        sendResponse({ response: state });
        if (state.isStreamActive) {
            startOffscreenWebgazer();
        } else {
            stopOffscreenWebgazer();
        }
    }
    return true;
});
  
function setState(isActive) {
    state.isStreamActive = isActive;
    console.log(`Stream state updated: ${isActive}`);
}
