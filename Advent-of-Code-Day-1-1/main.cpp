#include <iostream>
#include <string>
#include <fstream>

int main() {
	std::ifstream file("input.txt");

	std::string line;

	int i = 0;

	int currElf = 0;
	int mostElf = 0;

	while(std::getline(file, line)) {
		if(line.empty()) {
			if(currElf > mostElf) {
				mostElf = currElf;
			}
			
			currElf = 0;

			continue;
		}

		currElf += std::stoi(line);
	}

	if(currElf > mostElf) {
		mostElf = currElf;
	}

	std::cout << mostElf << "\n";

	return 0;
}