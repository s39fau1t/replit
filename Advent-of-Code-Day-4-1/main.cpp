#include <iostream>
#include <string>
#include <fstream>

int main() {
	std::ifstream file("input.txt");

	std::string line;

	int fullyContain = 0;

	while(std::getline(file, line)) {
		int comma = line.find(",");
		
		std::string elf1 = line.substr(0, comma);
		std::string elf2 = line.substr(comma + 1);

		int dash = elf1.find("-");

		int min1 = std::stoi(elf1.substr(0, dash));
		int max1 = std::stoi(elf1.substr(dash + 1));

		dash = elf2.find("-");

		int min2 = std::stoi(elf2.substr(0, dash));
		int max2 = std::stoi(elf2.substr(dash + 1));

		if((min1 <= min2 && max1 >= max2) || (min2 <= min1 && max2 >= max1)) {
			fullyContain ++;
		}
	}

	std::cout << fullyContain << "\n";
	
	return 0;
}