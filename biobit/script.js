fetch("bookmartlet.js").then(response => response.text()).then(data => {
	document.getElementById("bookmartlet").href = `javascript:${data}`;
});