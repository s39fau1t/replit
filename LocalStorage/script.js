let timesVisited = parseFloat(localStorage.getItem("timesVisited")) || 0;

localStorage.setItem("timesVisited", ++ timesVisited);

document.getElementById("visited-num").textContent = timesVisited;