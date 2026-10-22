import sys

inFileName = sys.argv[1]

outFileName = sys.argv[2]

brainf = ""

inFile = open(inFileName, "rt")

contents = inFile.read()

inFile.close()

lastAscii = 0

for letter in contents:
	letterAscii = ord(letter)

	dist = abs(lastAscii - letterAscii)

	for i in range(dist):
		if letterAscii > lastAscii:
			brainf += "+"
		else:
			brainf += "-"
	
	brainf += "."

	lastAscii = letterAscii

brainf += "[-]"

outFile = open(outFileName, "wt")

outFile.write(brainf)

outFile.close()

print("Your Brainf code is:\n" + brainf)