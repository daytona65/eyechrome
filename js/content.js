// Inject WebGazer.js
console.log("content script is running");
const script = document.createElement('script');
console.log("1!");
script.src = chrome.runtime.getURL('webgazer.js');
console.log("2!");
// document.head.appendChild(script);
console.log("is it really!");
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Error getting state:', chrome.runtime.lastError);
  } else {
   console.log("success", response)
  }
})
console.log(response);
script.onload = function() {
  script.remove();

  // Start WebGazer
  webgazer.setRegression('ridge')
          .setGazeListener((data, elapsedTime) => {
            if (data == null) {
              return;
            }
            const xPrediction = data.x;
            const yPrediction = data.y;
            console.log(`x: ${xPrediction}, y: ${yPrediction}`);
          }).begin();
};

// let allData = [];
//       webgazer.showPredictionPoints(false);
//       webgazer.showVideo(false);
//       webgazer
//         .setGazeListener(function (data) {
//           if (data == null) {
//             return;
//           }
//           allData.push({
//             x: data.x / window.innerWidth,
//             y: data.y / window.innerHeight,
//           });
//           if (allData.length > 20) {
//             allData.shift();
//           }
//           let avgX = 0,
//             avgY = 0;
//           for (let i = 0; i < allData.length; i++) {
//             avgX += allData[i].x;
//             avgY += allData[i].y;
//           }
//           avgX /= allData.length;
//           avgY /= allData.length;
//           let point = document.getElementById("point");
//           if (point == undefined) {
//             point = document.createElement("div");
//             point.id = "point";
//             point.style =
//               "position:fixed;width:30px;height:30px;border-radius:50%;background-color:rgba(0, 0, 0, 0.2);border:0.5px solid black;";
//             document.body.appendChild(point);
//           }
//           point.style.left = avgX * 100 + "%";
//           point.style.top = avgY * 100 + "%";
//           if (avgY > 0.7) {
//             window.scrollBy(0, 2);
//           }
//           if (avgY < 0.3) {
//             window.scrollBy(0, -2);
//           }
//         })
//         .begin();