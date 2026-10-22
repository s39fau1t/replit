#include <iostream>
#include <string>
#include <fstream>

int main() {
	std::ifstream file("input.txt");

	std::string line;

	int i = 0;

	int currElf = 0;
	int top3[3] = {0, 0, 0};

	while(std::getline(file, line)) {
		if(line.empty()) {
			for(int &elf : top3) {
				if(currElf > elf) {
					std::swap(elf, currElf);
				}
			}
			
			currElf = 0;

			continue;
		}

		currElf += std::stoi(line);
	}

	for(int &elf : top3) {
		if(currElf > elf) {
			std::swap(elf, currElf);
		}
	}

	int sum = 0;

	for(int elf : top3) {
		sum += elf;
	}

	std::cout << sum << "\n";
	
	return 0;
}