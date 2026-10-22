function openPopup() {
	const popup = open("javascript:\"\"", "", `left=${Math.random() * (screen.availWidth - 400)},top=${Math.random() * (screen.availHeight - 400)},width=400,height=400`);

	popup.document.write("<head><title>The Hydra</title><style>h1, h3 {text-align: center;}</style></head><body><h1>You cannot stop the hydra</h1><h3>Kill one head, and two more appear</h3></body>");

	function check() {
		if(popup.closed) {
			openPopup();
			openPopup();
		}else {
			requestAnimationFrame(check);
		}
	}

	check();
}

if(!screenTop && !screenY) {
	alert("Exit fullscreen for this to work");

	window.onresize = () => {
		setTimeout(() => {
			if(screenTop && screenY) {
				openPopup();
	
				window.onresize = null;
			}
		}, 100);
	}
}else {
	openPopup();
}