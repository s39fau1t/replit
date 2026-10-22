import time

def animPrint(text):
	for letter in text:
		print(letter, end = "", flush = True)
		time.sleep(0.1)