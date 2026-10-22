const text = document.getElementById("text"), voiceList = document.getElementById("voice-list"), speakButton = document.getElementById("speak-button");

let voices;

speechSynthesis.onvoiceschanged = () => {
	voices = speechSynthesis.getVoices();

	for(let voice of voices) {
		const option = document.createElement("option");

		option.textContent = `${voice.name} (${voice.lang})`;

		option.value = voice.name;

		voiceList.appendChild(option);
	}
};

speakButton.onclick = () => {
	const utterance = new SpeechSynthesisUtterance(text.value);

	for(let voice of voices) {
		if(voice.name === voiceList.selectedOptions[0].value) {
			utterance.voice = voice;
		}
	}

	speechSynthesis.speak(utterance);
};