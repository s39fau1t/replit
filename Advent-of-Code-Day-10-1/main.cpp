#include <iostream>
#include <string>
#include <fstream>
#include <regex>

void addCycles(int &cycles, int x, int &sum) {
	cycles ++;
	
	if((cycles - 20) % 40 == 0) {
		sum += x * cycles;
	}
}

int main() {
	std::ifstream file("input.txt");

	std::string line;

	int x = 1;

	int cycles = 0;

	int sum = 0;

	std::regex addxRegex(R"(addx (-?\d*))");

	while(std::getline(file, line)) {
		std::smatch match;

		if(std::regex_match(line, match, addxRegex)) {
			int amount = std::stoi(match.str(1));
			
			addCycles(cycles, x, sum);
			
			addCycles(cycles, x, sum);

			x += amount;
		}else {
			addCycles(cycles, x, sum);
		}
	}

	std::cout << sum << "\n";
	
	return 0;
}