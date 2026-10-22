#include <iostream>
#include <string>
#include <map>
#include <fstream>

int getPriority(char c) {
	//Lowercase
	if(c > 90) {
		return c - 96;
	//Uppercase
	}else {
		return c - 38;
	}
}

int main() {
	std::ifstream file("input.txt");

	std::string line1;
	std::string line2;
	std::string line3;

	int sum = 0;

	while(std::getline(file, line1) && std::getline(file, line2) && std::getline(file, line3)) {
		std::map<char, bool> line1Found;

		for(char c : line1) {
			line1Found[c] = true;
		}
		
		std::map<char, bool> line2Found;

		for(char c : line2) {
			line2Found[c] = true;
		}
		
		std::map<char, bool> line3Found;

		for(char c : line3) {
			if(line1Found[c] && line2Found[c]) {
				sum += getPriority(c);

				break;
			}
		}
	}

	std::cout << sum << "\n";
}