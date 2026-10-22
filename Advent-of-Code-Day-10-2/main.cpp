#include <iostream>
#include <string>
#include <fstream>
#include <regex>
#include <array>
#include <algorithm>

void addCycles(int &cycles, int x, std::array<std::array<bool, 40>, 6> &screen) {
	cycles ++;
	
	int col = (cycles - 1) % 40;
	
	if(col == x - 1 || col == x || col == x + 1) {
		int row = (cycles - 1) / 40;
		
		screen[row][col] = true;
	}
}

int main() {
	std::ifstream file("input.txt");

	std::string line;

	int x = 1;

	int cycles = 0;
	
	std::array<std::array<bool, 40>, 6> screen;
	
	for(std::array<bool, 40> &row : screen) {
		std::fill(row.begin(), row.end(), false);
	}

	std::regex addxRegex(R"(addx (-?\d*))");

	while(std::getline(file, line)) {
		std::smatch match;

		if(std::regex_match(line, match, addxRegex)) {
			int amount = std::stoi(match.str(1));
			
			addCycles(cycles, x, screen);
			
			addCycles(cycles, x, screen);

			x += amount;
		}else {
			addCycles(cycles, x, screen);
		}
	}
	
	for(const std::array<bool, 40> &row : screen) {
		for(bool pixel : row) {
			if(pixel) {
				std::cout << "#";
			}else {
				std::cout << ".";
			}
		}
		std::cout << "\n";
	}
	
	return 0;
}
