if (typeof allData === 'undefined') {
  var allData = [];
  var calibrationData = [];
  var recalibrationData = [];
  let centre;
  let calibrated = false;
  let startCalibrating = false;
}

// Reset calibration with each website
allData.length = 0;
calibrationData.length = 0;
calibrated = false;
startCalibrating = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function average(data) {
  let total = data.reduce((accumulator, currentValue) => {
    accumulator.x += currentValue.x;
    accumulator.y += currentValue.y;
    return accumulator;
  }, { x: 0, y: 0 });
  const avgX = total.x / data.length;
  const avgY = total.y / data.length;
  return { avgX: avgX, avgY: avgY };
}

// Receive coordinates and execute scrolling on window
chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
  if (data.type = 'scroll') {
    // console.log("Data received", data.coordinates)
    var { x, y } = data.coordinates
    if (calibrated) {
      scroll(x, y);
    } else {
      calibrate(x, y);
    }
    sendResponse({ response: 'Coordinates received' });
    return true;
  }
});

async function calibrate(x, y) {
  let calibratePoint = document.getElementById("calibratePoint");
  if (calibratePoint == undefined) {
    calibratePoint = document.createElement("div");
    calibratePoint.id = "calibratePoint";
    calibratePoint.style = `
      position: fixed;
      display: flex;
      z-index: 2147483647;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: yellow;
      font-weight: bold;
      border: 1px solid black;
      align-items: center;
      justify-content: center;
      text-align: center;
      `;
    calibratePoint.innerHTML = "LOOK HERE";
    var left = (window.innerWidth - calibratePoint.offsetWidth) / 2.1;
    var top = (window.innerHeight - calibratePoint.offsetHeight) / 1.6;
    calibratePoint.style.left = `${left}px`;
    calibratePoint.style.top = `${top}px`;
    document.body.appendChild(calibratePoint);
    await sleep(4000);
    startCalibrating = true;
  } else {
    if (calibratePoint.style.background == 'yellow') {
      calibratePoint.style.background = 'red';
      calibratePoint.style.color = 'white';
    } else if (calibratePoint.style.background == 'red') {
      calibratePoint.style.background = 'yellow';
      calibratePoint.style.color = 'black';
    }
  }

  if (startCalibrating) {
    if (calibrationData.length < 50) {
      calibrationData.push({
        x: x,
        y: y,
      });
    } else {
      calibratePoint.style.background = 'green';
      calibratePoint.style.color = 'white';
      calibratePoint.innerHTML = "Eyechrome Calibrated!"
      calibrated = true;
      setTimeout(() => calibratePoint.remove(), 3000);
      centre = calibrationData.reduce((accumulator, currentValue) => {
        accumulator.x += currentValue.x;
        accumulator.y += currentValue.y;
        return accumulator;
      }, { x: 0, y: 0 });
      console.log("CALIBRATED");
      centre = { x: centre.x / calibrationData.length, y: centre.y / calibrationData.length };
    }
  }
    
}

function scroll(x, y) {
  allData.push({
    x: x,
    y: y,
  });

  if (allData.length > 3) {
    allData.shift();
  }
  
  var { avgX, avgY } = average(allData);

  let dpr = window.devicePixelRatio;
  let deviationLimit = window.innerHeight / 100 * dpr;
  let deviation = centre.y - avgY

  // // Recalibration
  // if (Math.abs(deviation) > staticViewPort*1.5) {
  //   console.log("Add recalibrationData");
  //   recalibrationData.push({
  //     x: 0,
  //     y: deviation
  //   });
  // } else {
  //   console.log("Remove recalibrationData");
  //   recalibrationData.pop(); // Removes outliers
  // }

  // // Persistent outliers
  // if (recalibrationData.length > 30) {
  //   console.log("RECALIBRATE");
  //   var { avgX, avgY } = average(recalibrationData);
  //   centre.y -= avgY - staticViewPort
  //   recalibrationData.length = 0;
  // }

  if (deviation < 0) { // Upscrolling
    deviation *= 1.6
  }
  // console.log(deviationLimit);
  // console.log(centre.y);
  // console.log(deviation);
  if (Math.abs(deviation) > deviationLimit) {
    window.scrollBy({
      top: deviation < 0 ? -4 : 4,
      left: 0,
      behavior: "smooth",
    });
  }
}

