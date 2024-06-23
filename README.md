# eyechrome :eyes:
Browse webpages with your eyes via a chrome extension. Read pages without having to scroll manually, as the extension intuitively scrolls as you read up or down a page.

A little side project from May'24 to June'24 using [WebGazer](https://webgazer.cs.brown.edu/), an eye tracking library. I took some inspiration from just a couple others who have attempted this specific project (website navigation using gaze prediction from built-in webcams, specifically with webgazer) and many more who have tried and failed with other gaze prediction libraries.

Managed to work around limitations faced by [Rhys Mills](https://github.com/rhystmills) in his [eyegaze-browser](https://github.com/rhystmills/eyegaze-browser) with the help of offscreen DOMs in Manifest V3.

### How does it work?
This extension runs WebGazer in an offscreen DOM which then calls on the currently active tab's content script which executes the scrolls on the page. WebGazer does all the heavy lifting with fast and relatively accurate gaze predictions using a pretrained eye tracking model.

The extension UI I designed is simple and easy to use with just one button to enable and disable your webcam and visual prompts for calibration. 

Future improvements include side scrolling, blink gestures for back and forwards navigation and switching tabs.

### How to use:
Download this from the chrome extension store. Otherwise:
1. Turn on developer mode in your [chrome extensions](chrome://extensions/) page.
2. Click load unpacked and load this entire directory. 



