#https://www.w3schools.com/python/python_functions.asp

from utilities import doEvent

anEvent = [
	{"type": "text", "text": "You wake up in a dark room. There is no sound."},
	{"type": "question", "text": "Do you walk left, right, forewards, or backwards?", "outcomes": {
		"left": [
			{"type": "text", "text": "You walk left for a while.\n...\n...\n...\n"}
		],
		"right": [],
		"forewards": [],
		"backwards": []
	}}
]

doEvent(anEvent)