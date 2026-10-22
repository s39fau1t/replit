import time

def isElipsis(text, index):
	return text[index:index + 3] == "..." or text[index - 1:index + 2] == "..." or text[index - 2:index + 1] == "..."

def animPrint(text):
	for i in range(len(text)):
		letter = text[i]

		print(letter, end = "", flush = True)
		time.sleep(0.5) if isElipsis(text, i) else time.sleep(0.1)

def doEvent(event):
	for element in event:
		elType = element["type"]
		elTxt = element["text"]

		if elType == "text":
			animPrint(elTxt + "\n\n")
		elif elType == "question":
			animPrint(elTxt + "\n")
			answer = input().lower()

			outcomes = event[event.index(element)]["outcomes"]

			if answer in outcomes:
				doEvent(outcomes[answer])
			else:
				doEvent([element])