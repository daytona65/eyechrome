// Inject WebGazer.js
// Content logging is in website console
console.log("content script is running");
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/webgazer.js');
script.type = 'text/javascript'
console.log("window content-script: ", window.innerWidth); //1536 x 730
let allData = []
// Receive coordinates and execute scrolling on window
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  if (data.type = 'scroll') {
    var { xNorm, yNorm } = data.coordinates
    allData.push({
      predX: xNorm,
      predY: yNorm,
    });
  
    if (allData.length > 10) {
      allData.shift();
    }
  
    let avgX = 0, avgY = 0;
    for (let i = 0; i < allData.length; i++) {
      avgX += allData[i].predX;
      avgY += allData[i].predY;
    }
  
    avgX /= allData.length;
    avgY /= allData.length;
  
    let point = document.getElementById("point");
    if (point == undefined) {
      point = document.createElement("div");
      point.id = "point";
      point.style =
      "position:fixed;width:20px;height:20px;border-radius:50%;background-color: red;border:0.5px solid black;";
      document.body.appendChild(point);
    }
    point.style.left = avgX * 100 + "%";
    point.style.top = avgY * 100 + "%";
    console.log(avgY);
    if (avgY > 1.2) {
      window.scrollBy(0, 2);
    }
    if (avgY < 0.001) {
      window.scrollBy(0, -2);
    }
  }
  return true;
});
