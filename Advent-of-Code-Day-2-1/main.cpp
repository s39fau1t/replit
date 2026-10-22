#include <iostream>
#include <string>
#include <fstream>

char getWinningToken(char opponent) {
	switch(opponent) {
		case 'A':
			return 'Y';
		case 'B':
			return 'Z';
		case 'C':
			return 'X';
	}
}

char getDrawingToken(char opponent) {
	switch(opponent) {
		case 'A':
			return 'X';
		case 'B':
			return 'Y';
		case 'C':
			return 'Z';
	}
}

int main() {
	std::ifstream file("input.txt");

	int score = 0;

	std::string line;

	while(std::getline(file, line)) {
		char opponent = line[0];
		char you = line[2];

		//Did you win?
		if(getWinningToken(opponent) == you) {
			score += 6;
		}else if(getDrawingToken(opponent) == you) {
			score += 3;
		}

		//Score from what you played
		switch(you) {
			case 'X':
				score ++;
				break;
			case 'Y':
				score += 2;
				break;
			case 'Z':
				score += 3;
				break;
		}
	}

	std::cout << score << "\n";
	
	return 0;
}