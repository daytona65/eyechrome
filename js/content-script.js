// Inject WebGazer.js
let allData = []
let calibrationData = []
let centre;
let calibrationBuffer = 0
let calibrated = false;

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
  }
  sendResponse({ response: 'Coordinates received' })
  return true;
});

function calibrate(x, y) {
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
    calibratePoint.innerHTML = "LOOK HERE"
    var left = (window.innerWidth - calibratePoint.offsetWidth) / 2.1;
    var top = (window.innerHeight - calibratePoint.offsetHeight) / 1.6;
    calibratePoint.style.left = `${left}px`;
    calibratePoint.style.top = `${top}px`;
    document.body.appendChild(calibratePoint);
  } else {
    if (calibratePoint.style.background == 'yellow') {
      calibratePoint.style.background = 'red';
      calibratePoint.style.color = 'white';
    } else if (calibratePoint.style.background == 'red') {
      calibratePoint.style.background = 'yellow';
      calibratePoint.style.color = 'black';
    }
  }
  if (calibrationBuffer >= 30) {
    if (calibrationData.length < 20) {
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
      centre = { x: centre.x / calibrationData.length, y: centre.y / calibrationData.length };
      console.log("CALIBRATED! ", centre.y);
    }
  } else {
    calibrationBuffer += 1;
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

  let total = allData.reduce((accumulator, currentValue) => {
    accumulator.x += currentValue.x;
    accumulator.y += currentValue.y;
    return accumulator;
  }, { x: 0, y: 0 });

  avgX = total.x / allData.length;
  avgY = total.y / allData.length;

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

  let scale = 1
  let deviation = centre.y - avgY
  if (deviation > 0) {
    deviation *= 1.5
  }
  let scrollDistance = 1 / (1 + Math.exp(-deviation / scale))
  if (Math.abs(deviation) > 5) {
    window.scrollBy({
      top: deviation,
      left: 0,
      behavior: "smooth",
    });
  }
}

