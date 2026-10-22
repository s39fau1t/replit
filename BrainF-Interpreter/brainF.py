import sys

#https://stackoverflow.com/questions/510357/how-to-read-a-single-character-from-the-user

class _Getch:
    """Gets a single character from standard input.  Does not echo to the screen."""
    def __init__(self):
        try:
            self.impl = _GetchWindows()
        except ImportError:
            self.impl = _GetchUnix()

    def __call__(self): return self.impl()

class _GetchUnix:
    def __init__(self):
        import tty, sys

    def __call__(self):
        import sys, tty, termios
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            ch = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return ch


class _GetchWindows:
    def __init__(self):
        import msvcrt

    def __call__(self):
        import msvcrt
        return msvcrt.getch()

actualGetch = _Getch()

def getch():
	txt = actualGetch()

	if txt == "\r":
		txt = "\n"
		
	print(txt, end = "", flush = True)

	return txt

class BrainFException(Exception):
	def __init__(self, txt, line, contents):
		exceptionTxt = txt + " at line " + str(line) + "\n\n"

		start = line - 5

		if start < 0:
			start = 0

		end = line + 5

		if end > len(contents):
			end = len(contents)

		exceptionTxt += contents[start:end + 1] + "\n"

		exceptionTxt += "     ^" if line - 5 >= 0 else "    ^" if line - 4 >= 0 else "   ^" if line - 3 >= 0 else "  ^" if line - 2 >= 0 else " ^" if line - 1 >= 0 else "^"

		super().__init__(exceptionTxt)

def brainF(contents, inputFile, outputFile):
	pointer = 0

	cells = [0]

	loopPositions = []

	if inputFile != sys.stdin:
		inputFileContents = inputFile.read()

	inputFilePos = 0

	i = 0

	while i < len(contents):
		letter = contents[i]

		if letter == "<":
			pointer -= 1

			if pointer < 0:
				raise BrainFException("Out of bounds pointer", i, contents)
		elif letter == ">":
			pointer += 1

			if pointer + 1 > len(cells):
				cells.append(0)
		elif letter == "+":
			cells[pointer] += 1
		elif letter == "-":
			cells[pointer] -= 1
		elif letter == ".":
			outputFile.write(chr(cells[pointer]))
		elif letter == ",":
			if inputFile == sys.stdin:
				cells[pointer] = ord(getch())
			else:
				if inputFilePos < len(inputFileContents):
					cells[pointer] = ord(inputFileContents[inputFilePos])

					inputFilePos += 1
				else:
					cells[pointer] = 0
		elif letter == "[":
			if cells[pointer] != 0:
				loopPositions.append(i)
			else:
				loopLevel = 0

				loopEnd = 0

				for j in range(i + 1, len(contents)):
					if contents[j] == "[":
						loopLevel += 1
					elif contents[j] == "]":
						if not loopLevel:
							loopEnd = j

							break
						else:
							loopLevel -= 1

				if not loopEnd:
					raise BrainFException("Unbalanced loop", i, contents)
				else:
					i = loopEnd
		elif letter == "]":
			i = loopPositions[-1] - 1

			loopPositions.pop(-1)
		i += 1
	if loopPositions:
		raise BrainFException("Unbalanced loop", loopPositions[0], contents)

try:
	brainFFile = open(sys.argv[1], "rt")

	contents = brainFFile.read()

	brainFFile.close()
except:
	raise Exception("Must enter a BrainF file to be interpreted")

try:
	if sys.argv[2] != "stdin":
		inputFile = open(sys.argv[2], "rt")
	else:
		inputFile = sys.stdin
except:
	inputFile = sys.stdin

try:
	if sys.argv[3] != "stdout":
		outputFile = open(sys.argv[3], "at")
	else:
		outputFile = sys.stdout
except:
	outputFile = sys.stdout

brainF(contents, inputFile, outputFile)

inputFile.close()
outputFile.close()