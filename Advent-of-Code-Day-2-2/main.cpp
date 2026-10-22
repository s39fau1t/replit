#include <iostream>
#include <string>
#include <fstream>

char getWinningToken(char opponent) {
	switch(opponent) {
		case 'A':
			return 'B';
		case 'B':
			return 'C';
		case 'C':
			return 'A';
	}
}

char getLosingToken(char opponent) {
	switch(opponent) {
		case 'A':
			return 'C';
		case 'B':
			return 'A';
		case 'C':
			return 'B';
	}
}

int getTokenScore(char c) {
	switch(c) {
		case 'A':
			return 1;
		case 'B':
			return 2;
		case 'C':
			return 3;
	}
}

int main() {
	std::ifstream file("input.txt");

	int score = 0;

	std::string line;

	while(std::getline(file, line)) {
		char opponent = line[0];
		char what = line[2];

		switch(what) {
			//Lose
			case 'X':
				score += getTokenScore(getLosingToken(opponent));
				break;
			//Draw
			case 'Y':
				score += 3 + getTokenScore(opponent);
				break;
			//Win
			case 'Z':
				score += 6 + getTokenScore(getWinningToken(opponent));
				break;
		}
	}

	std::cout << score << "\n";
	
	return 0;
}