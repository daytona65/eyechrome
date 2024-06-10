// Context of webpage, navigation logic here

// Inject WebGazer.js
const script = document.createElement('script');
script.src = chrome.runtime.getURL('webgazer.js');
document.head.appendChild(script);

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