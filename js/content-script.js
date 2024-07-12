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
  avgX = total.x / data.length;
  avgY = total.y / data.length;
  return { x: avgX, y: avgY };
}

// Receive coordinates and execute scrolling on window
chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
  if (data.type = 'scroll') {
    console.log("Data received", data.coordinates)
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
      setTimeout(() => calibratePoint.remove(), 3000);
      calibrated = true;
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

  if (allData.length > 5) {
    allData.shift();
  }
  
  var { avgX, avgY } = average(allData);

  let point = document.getElementById("point");
  if (point == undefined) {
    point = document.createElement("div");
    point.id = "point";
    point.style = `
      position:fixed;
      width:20px;
      height:20px;
      border-radius:50%;
      background-color: red;
      border:0.5px solid black;
      `;
    // document.body.appendChild(point);
  }
  point.style.left = `${avgX}px`;
  point.style.top = `${avgY}px`;

  let dpr = window.devicePixelRatio;
  let staticViewPort = window.innerHeight / 100 * dpr;
  let deviation = centre.y - avgY
  if (Math.abs(deviation) > staticViewPort * 2) {
    recalibrationData.push({
      x: 0,
      y: deviation
    });
  }

  if (recalibrationData.length > 100) {
    var { avgDevX, avgDevY } = average(recalibrationData);
    // TODO Recalibrate centre
  }

  if (deviation > 0) {
    deviation *= 1.1
  }
  console.log(staticViewPort);
  console.log(centre.y);
  if (Math.abs(deviation) > staticViewPort) {
    window.scrollBy({
      top: deviation,
      left: 0,
      behavior: "smooth",
    });
  }
}

