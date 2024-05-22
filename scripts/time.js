const time = document.getElementById("time")
const currentTime = new Date().toLocaleTimeString()
time.textContent = `The time is: ${currentTime}`