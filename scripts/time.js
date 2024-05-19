const time = document.getElementById("time")
const currentTiemm = new Date().toLocaleTimeString()
time.textContent = `The time is: ${currentTiemm}`